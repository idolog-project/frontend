import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, Search, X } from 'lucide-react'

import type { Idol } from '@/api/schemas'
import { UNFEATURED_PIN_COLOR } from '@/features/idol/colors'
import { searchIdols } from '@/features/idol/search'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/** How many idols the status line names before it falls back to a count. */
const NAMES_SHOWN = 3

/**
 * Search box for the map's idol filter.
 *
 * It replaces a dropdown that listed all forty-eight idols: a list that long is
 * faster to type into than to scan. Opening the box with nothing typed still
 * shows suggestions — the most-filmed idols — so it is never a blank prompt.
 *
 * The line underneath always says what the map is currently showing. That
 * reading used to sit on the filter chip this box replaced, and dropping it
 * would leave no way to tell a filtered map from a sparse one.
 */
export function IdolSearch({
  idols,
  selectedIdols,
  colors,
  spotCount,
  onToggle,
  onClear,
}: {
  idols: Idol[]
  /** Everyone currently filtered on. Empty means the whole map. */
  selectedIdols: Idol[]
  /** Legend colours, so a suggestion's dot matches its pins. */
  colors: Map<number, string>
  /** Locations currently on the map. */
  spotCount: number
  onToggle: (idolId: number) => void
  onClear: () => void
}) {
  const t = useT()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const suggestions = useMemo(() => searchIdols(idols, query), [idols, query])
  const selectedIds = useMemo(
    () => new Set(selectedIdols.map((idol) => idol.id)),
    [selectedIdols],
  )

  // The list scrolls, so arrowing past its edge has to bring the row along —
  // otherwise the highlight walks off screen and the keyboard feels broken.
  useEffect(() => {
    if (!open) return
    listRef.current?.children[highlight]?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const close = () => {
    setOpen(false)
    setQuery('')
    setHighlight(0)
  }

  /**
   * Flips one idol in or out of the filter and leaves the list open.
   *
   * Closing after each pick would make choosing three idols three round trips
   * through the box. The query is cleared instead, which puts the popularity
   * order back so the next name is typed against the same starting list.
   */
  const toggle = (idolId: number) => {
    onToggle(idolId)
    setQuery('')
    setHighlight(0)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close()
      inputRef.current?.blur()
      return
    }
    if (!open || suggestions.length === 0) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      // Otherwise the caret jumps to either end of the text instead.
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setHighlight((current) => (current + step + suggestions.length) % suggestions.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      toggle(suggestions[highlight].id)
    }
  }

  return (
    <div
      // Full width on a phone, where the box has nothing to sit beside: a wider
      // target for a thumb, and the suggestion list under it inherits the room.
      className="pointer-events-auto relative w-full md:w-64"
      // Closing on the input's own blur would fire before a suggestion's click
      // lands. Watching the wrapper lets focus move between the two freely.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 backdrop-blur-md transition-colors focus-within:border-border-strong">
        <Search size={16} strokeWidth={1.5} aria-hidden className="shrink-0 text-text-subtle" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions.length > 0 ? `${listId}-${highlight}` : undefined}
          placeholder={t('home.searchIdol')}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setHighlight(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          // 16px on a phone: iOS zooms the whole page in when a smaller input
          // takes focus, and it does not zoom back out when the field is done.
          className="w-full bg-transparent text-body-md text-text outline-none placeholder:text-text-subtle md:text-body-sm"
        />
      </div>

      {/* What the map is showing, and the way back to all of it.

          On a phone the map is the whole background, so this line lands on
          terrain and place names rather than the dark panel it sits on from
          `md` up. It carries its own ground there, sized to the text so it
          reads as a caption and not a second control. */}
      <div className="mt-1.5 flex items-center justify-end gap-1.5 text-caption text-text-subtle">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full bg-background/75 px-2.5 py-0.5 backdrop-blur-sm',
            'md:bg-transparent md:px-0 md:py-0 md:pr-1 md:backdrop-blur-none',
          )}
        >
          {/* Names while they fit, a count once they do not. Three is what the
              box holds before the line starts eating itself with an ellipsis,
              and a name says more than a number — past three the rest are still
              legible in the legend and the URL. */}
          <span className="truncate">
            {selectedIdols.length === 0
              ? t('home.filterAll')
              : selectedIdols.length <= NAMES_SHOWN
                ? selectedIdols.map((idol) => idol.name).join(', ')
                : t('home.filterMore', {
                    names: selectedIdols
                      .slice(0, NAMES_SHOWN)
                      .map((idol) => idol.name)
                      .join(', '),
                    count: selectedIdols.length - NAMES_SHOWN,
                  })}
          </span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{t('home.spotCount', { count: spotCount })}</span>
          {selectedIdols.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              aria-label={t('home.clearFilter')}
              // The padding is the tap area on a phone — a 13px glyph is not one.
              // It hangs out of the line rather than growing it, so the row keeps
              // its height and the list below does not shift when a filter lands.
              className="-my-2 rounded-full p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text md:my-0 md:p-0.5"
            >
              <X size={13} strokeWidth={2} aria-hidden />
            </button>
          )}
        </span>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-full overflow-hidden rounded border border-border bg-surface">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-body-sm text-text-subtle">{t('home.searchNoMatch')}</p>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable
              aria-label={t('home.searchSuggestions')}
              // Roughly seven rows: enough to judge the ranking at a glance,
              // short enough to leave the map visible behind it. On a short
              // phone the viewport is the binding limit, so the list yields to
              // it rather than covering the map it is meant to filter.
              className="max-h-[min(18rem,50dvh)] overflow-y-auto overscroll-contain md:max-h-72"
            >
              {suggestions.map((idol, index) => (
                <li key={idol.id}>
                  <button
                    type="button"
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={selectedIds.has(idol.id)}
                    // Keeps focus in the input, so the wrapper's blur never fires.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => toggle(idol.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-body-sm transition-colors',
                      index === highlight && 'bg-surface-raised',
                      selectedIds.has(idol.id) && 'text-primary',
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: colors.get(idol.id) ?? UNFEATURED_PIN_COLOR,
                      }}
                    />
                    <span className="flex-1 truncate">{idol.name}</span>
                    <span className="tabular-nums text-caption text-text-subtle">
                      {t('home.spotCount', { count: idol.locationCount })}
                    </span>
                    {/* The list stays open across picks, so each row has to say
                        for itself whether it is already in the filter. */}
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      aria-hidden
                      className={cn(
                        'shrink-0',
                        selectedIds.has(idol.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
