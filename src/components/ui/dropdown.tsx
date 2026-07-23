"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";

import {
  DropdownChevron,
  DropdownError,
  DropdownLabel,
  DropdownMenu,
  DropdownOptionLabel,
  DropdownOptionRow,
  DropdownRoot,
  DropdownSelectedIndicator,
  DropdownTrigger,
  DropdownValue,
} from "./dropdown.styles";

export type DropdownOption<Value extends string> = {
  value: Value;
  label: string;
  accessibleLabel?: string | undefined;
  leadingVisual?: ReactNode | undefined;
  triggerContent?: ReactNode | undefined;
  disabled?: boolean | undefined;
};

export type DropdownProps<Value extends string> = {
  id: string;
  options: readonly DropdownOption<Value>[];
  value: Value | null;
  onValueChange: (value: Value) => void;
  ariaLabel?: string | undefined;
  align?: "start" | "end" | undefined;
  className?: string | undefined;
  describedBy?: string | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
  label?: string | undefined;
  listboxLabel?: string | undefined;
  name?: string | undefined;
  onBlur?: (() => void) | undefined;
  onOpen?: (() => void) | undefined;
  placeholder?: string | undefined;
  // Nullable on purpose: the handle mirrors the internal trigger ref, which is
  // null until the button mounts. The previous `as HTMLButtonElement` cast hid
  // exactly that gap from every consumer.
  ref?: Ref<HTMLButtonElement | null> | undefined;
  required?: boolean | undefined;
  tone?: "floating" | "surface" | undefined;
  variant?: "field" | "compact" | undefined;
};

/**
 * A plain generic function rather than `forwardRef`: React 19 passes `ref`
 * through props, which keeps the `Value` type parameter intact. `forwardRef`
 * erases it, and the previous workaround was a cast that asserted a generic
 * signature the wrapped component did not actually have.
 */
export function Dropdown<Value extends string>({
  align = "start",
  ariaLabel,
  className,
  describedBy,
  disabled,
  error,
  id,
  label,
  listboxLabel,
  name,
  onBlur,
  onOpen,
  onValueChange,
  options,
  placeholder,
  ref: forwardedRef,
  required,
  tone,
  value,
  variant = "field",
}: DropdownProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [side, setSide] = useState<"bottom" | "top">("bottom");
  const [wasDisabled, setWasDisabled] = useState(Boolean(disabled));
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-listbox`;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeaheadRef = useRef("");
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const selectedOption =
    options.find((option) => option.value === value) ?? null;
  const ariaDescribedBy = [describedBy, error ? errorId : null]
    .filter(Boolean)
    .join(" ");
  const resolvedTone = tone ?? (variant === "compact" ? "floating" : "surface");

  if (wasDisabled !== Boolean(disabled)) {
    setWasDisabled(Boolean(disabled));
    if (disabled && isOpen) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  useEffect(
    () => () => {
      clearTimeout(typeaheadTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function updateSide() {
      setSide(getPreferredSide());
    }

    window.addEventListener("resize", updateSide);
    window.addEventListener("scroll", updateSide, true);
    return () => {
      window.removeEventListener("resize", updateSide);
      window.removeEventListener("scroll", updateSide, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  function getInitialIndex() {
    const selectedIndex = options.findIndex(
      (option) => option.value === value && !option.disabled,
    );
    return selectedIndex >= 0
      ? selectedIndex
      : options.findIndex((option) => !option.disabled);
  }

  function getPreferredSide(): "bottom" | "top" {
    const trigger = triggerRef.current;
    if (!trigger) {
      return "bottom";
    }

    const triggerBox = trigger.getBoundingClientRect();
    const menuHeight = Math.min(
      menuRef.current?.scrollHeight ?? 0,
      window.innerHeight * 0.45,
      288,
    );
    const viewportMargin = 16;
    const menuGap = 8;
    const availableBelow =
      window.innerHeight - triggerBox.bottom - viewportMargin - menuGap;
    const availableAbove = triggerBox.top - viewportMargin - menuGap;

    return availableBelow < menuHeight && availableAbove > availableBelow
      ? "top"
      : "bottom";
  }

  function openDropdown() {
    onOpen?.();
    setSide(getPreferredSide());
    setActiveIndex(getInitialIndex());
    setIsOpen(true);
  }

  function closeDropdown() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectValue(option: DropdownOption<Value>) {
    if (option.value !== value) {
      onValueChange(option.value);
    }
    closeDropdown();
    triggerRef.current?.focus();
  }

  function moveActive(direction: 1 | -1) {
    if (options.length === 0) {
      return;
    }

    let nextIndex = activeIndex;
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  }

  function normalizeForSearch(text: string) {
    return text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();
  }

  function findTypeaheadMatch(query: string) {
    const normalizedQuery = normalizeForSearch(query);
    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (activeIndex + offset + options.length) % options.length;
      const option = options[index];
      if (
        option &&
        !option.disabled &&
        normalizeForSearch(option.label).startsWith(normalizedQuery)
      ) {
        return index;
      }
    }
    return -1;
  }

  function handleTypeahead(key: string) {
    const nextQuery = `${typeaheadRef.current}${key}`;
    let matchIndex = findTypeaheadMatch(nextQuery);
    let acceptedQuery = nextQuery;

    if (matchIndex < 0 && nextQuery.length > 1) {
      acceptedQuery = key;
      matchIndex = findTypeaheadMatch(key);
    }

    typeaheadRef.current = acceptedQuery;
    clearTimeout(typeaheadTimeoutRef.current);
    typeaheadTimeoutRef.current = setTimeout(() => {
      typeaheadRef.current = "";
    }, 700);

    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(options.findIndex((option) => !option.disabled));
        break;
      case "End":
        event.preventDefault();
        for (let index = options.length - 1; index >= 0; index -= 1) {
          if (!options[index]?.disabled) {
            setActiveIndex(index);
            break;
          }
        }
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[activeIndex];
        if (option && !option.disabled) {
          selectValue(option);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        closeDropdown();
        break;
      default:
        if (
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          event.preventDefault();
          handleTypeahead(event.key);
        }
    }
  }

  function handleBlur(event: ReactFocusEvent<HTMLButtonElement>) {
    onBlur?.();
    if (
      !(event.relatedTarget instanceof Node) ||
      !rootRef.current?.contains(event.relatedTarget)
    ) {
      closeDropdown();
    }
  }

  return (
    <DropdownRoot
      className={className}
      data-align={align}
      data-variant={variant}
      ref={rootRef}
    >
      {label ? (
        <DropdownLabel htmlFor={id} id={labelId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </DropdownLabel>
      ) : null}
      <DropdownTrigger
        aria-activedescendant={
          isOpen && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy || undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={error ? "true" : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-required={required || undefined}
        data-empty={!selectedOption || undefined}
        data-tone={resolvedTone}
        data-value={value ?? ""}
        data-variant={variant}
        disabled={disabled}
        id={id}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        ref={(node) => {
          triggerRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
            return;
          }
          if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        role="combobox"
        type="button"
      >
        <DropdownValue>
          {selectedOption
            ? (selectedOption.triggerContent ?? (
                <>
                  {selectedOption.leadingVisual}
                  {selectedOption.label}
                </>
              ))
            : placeholder}
        </DropdownValue>
        <DropdownChevron
          aria-hidden="true"
          data-state={isOpen ? "open" : "closed"}
        />
      </DropdownTrigger>
      {name ? (
        <input
          disabled={disabled}
          name={name}
          readOnly
          type="hidden"
          value={value ?? ""}
        />
      ) : null}
      <DropdownMenu
        aria-label={listboxLabel ?? label ?? ariaLabel}
        aria-hidden={isOpen ? undefined : "true"}
        data-align={align}
        data-side={side}
        data-state={isOpen ? "open" : "closed"}
        data-variant={variant}
        id={listboxId}
        inert={isOpen ? undefined : true}
        ref={menuRef}
        role="listbox"
      >
        {options.map((option, index) => (
          <DropdownOptionRow
            aria-label={option.accessibleLabel}
            aria-selected={option.value === value}
            data-active={activeIndex === index || undefined}
            disabled={option.disabled}
            id={`${listboxId}-option-${index}`}
            key={option.value}
            onClick={() => selectValue(option)}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => {
              if (!option.disabled) {
                setActiveIndex(index);
              }
            }}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            role="option"
            tabIndex={-1}
            type="button"
          >
            {option.leadingVisual}
            <DropdownOptionLabel>{option.label}</DropdownOptionLabel>
            <DropdownSelectedIndicator
              aria-hidden="true"
              data-visible={option.value === value || undefined}
            >
              ✓
            </DropdownSelectedIndicator>
          </DropdownOptionRow>
        ))}
      </DropdownMenu>
      {error ? (
        <DropdownError id={errorId} role="alert">
          {error}
        </DropdownError>
      ) : null}
    </DropdownRoot>
  );
}
