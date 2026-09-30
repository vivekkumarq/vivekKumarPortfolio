import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  EXPERIENCE,
  NAV_LINKS,
  OPEN_SOURCE,
  PROFILE,
  PROJECTS,
  SKILLS,
  experienceLabel,
} from '../core/profile';
import { THEME_OPTIONS, ThemeService, type Theme } from './theme.service';
import { FONT_OPTIONS, TypographyService, type FontStyle } from './typography.service';

type Line = { text: string; tone: 'cmd' | 'out' | 'hi' | 'err' };

type Command = { help: string; run: (args: string[]) => Line[] | void };

const SECTIONS = NAV_LINKS.map((l) => l.href.slice(1));

/** "**bold**" markup is for the page; the terminal prints plain text. */
const plain = (s: string) => s.replace(/\*\*/g, '');

const out = (text: string): Line => ({ text, tone: 'out' });
const hi = (text: string): Line => ({ text, tone: 'hi' });
const err = (text: string): Line => ({ text, tone: 'err' });

/**
 * A small interactive shell in the hero window. Every answer is read from
 * core/profile, the same source the page renders, so the terminal can never
 * tell a different story from the sections below it.
 *
 * Tab completes commands and their arguments; ↑/↓ walk the history.
 */
@Component({
  selector: 'app-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <div
      #scroller
      class="h-full overflow-y-auto overscroll-contain p-4 font-mono text-[0.72rem] leading-6 sm:p-5 sm:text-[0.78rem]"
      (click)="focus()"
    >
      <div role="log" aria-live="polite" aria-label="Terminal output">
        @for (line of lines(); track $index) {
          <p
            class="break-words whitespace-pre-wrap"
            [class.text-ink]="line.tone === 'cmd'"
            [class.text-ink-dim]="line.tone === 'out'"
            [class.text-accent]="line.tone === 'hi'"
            [class.text-gold]="line.tone === 'err'"
          >{{ line.text }}</p>
        }
      </div>

      <label class="flex items-center gap-2">
        <span class="shrink-0 text-accent">vivek&#64;portfolio</span>
        <span class="-ml-2 shrink-0 text-ink-faint">:~$</span>
        <input
          #input
          type="text"
          aria-label="Terminal command"
          name="terminal-command"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          class="u-bare min-w-0 flex-1 bg-transparent text-base text-ink caret-accent outline-none sm:text-[0.78rem]"
          (keydown)="onKey($event)"
        />
      </label>
    </div>
  `,
})
export class TerminalComponent {
  private readonly theme = inject(ThemeService);
  private readonly typography = inject(TypographyService);

  /** Emitted by `exit`, so the host can switch back to the other tab. */
  readonly exit = output<void>();

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly lines = signal<Line[]>([
    hi(`${PROFILE.name} — interactive résumé shell`),
    out("Type 'help' to see what it can do. Tab completes, ↑ recalls."),
    out(''),
  ]);

  private readonly history: string[] = [];
  private historyIndex = 0;

  private readonly commands: Record<string, Command> = {
    help: {
      help: 'list available commands',
      run: () => [
        ...Object.entries(this.commands).map(([name, c]) => out(`  ${name.padEnd(11)}${c.help}`)),
      ],
    },
    whoami: {
      help: 'the short version',
      run: () => [
        hi(PROFILE.name),
        out(`${PROFILE.role} at ${PROFILE.company} · ${PROFILE.location}`),
        out(`${experienceLabel()} years building backend systems — ${PROFILE.subtitle}`),
      ],
    },
    experience: {
      help: 'current role, recruiter cut',
      run: () => {
        const role = EXPERIENCE[0];
        return [
          hi(`${role.title} · ${role.company}`),
          out(`${role.period} · ${role.location}`),
          ...role.quick.map((q) => out(`  › ${plain(q)}`)),
        ];
      },
    },
    skills: {
      help: 'the stack, by area',
      run: () =>
        SKILLS.map((g) => out(`  ${g.group.toLowerCase().padEnd(20)}${g.items.join(', ')}`)),
    },
    projects: {
      help: "things I've built — 'open <n>' to visit",
      run: () => [
        ...PROJECTS.map((p, i) =>
          out(`  ${String(i + 1).padStart(2)}  ${p.name}${p.live ? '  ● live' : ''} — ${p.blurb}`),
        ),
        out(''),
        out("Try 'open 1'."),
      ],
    },
    open: {
      help: 'open a project by number or name',
      run: ([arg]) => {
        const project =
          PROJECTS[Number(arg) - 1] ??
          PROJECTS.find((p) => arg && p.name.toLowerCase().includes(arg.toLowerCase()));
        if (!project) return [err("usage: open <number|name> — see 'projects'")];
        window.open(project.live ?? project.repo, '_blank', 'noopener,noreferrer');
        return [out(`Opening ${project.name}…`)];
      },
    },
    opensource: {
      help: 'merged upstream contributions',
      run: () => {
        let count = 0;
        const lines = OPEN_SOURCE.flatMap((p) => {
          const prs = p.contributions.filter((c) => c.kind === 'pr' && c.status === 'merged');
          count += prs.length;
          return prs.length
            ? [out(`${p.owner}/${p.project}`), ...prs.map((c) => out(`  #${c.number}  ${c.title}`))]
            : [];
        });
        return [hi(`${count} merged pull requests`), ...lines];
      },
    },
    contact: {
      help: 'how to reach me',
      run: () => [
        out(`  email     ${PROFILE.email}`),
        out(`  linkedin  ${PROFILE.linkedin}`),
        out(`  github    ${PROFILE.github}`),
      ],
    },
    resume: {
      help: 'download the PDF',
      run: () => {
        const a = document.createElement('a');
        a.href = PROFILE.resumePath;
        a.download = '';
        a.click();
        return [out('Downloading Vivek_Kumar_Resume.pdf…')];
      },
    },
    goto: {
      help: 'scroll to a section',
      run: ([arg]) => {
        if (!arg || !SECTIONS.includes(arg)) return [err(`usage: goto <${SECTIONS.join('|')}>`)];
        document.getElementById(arg)?.scrollIntoView();
        return [out(`→ #${arg}`)];
      },
    },
    theme: {
      help: 'list or switch colour themes',
      run: ([arg]) => {
        const match = THEME_OPTIONS.find((t) => t.id === arg || t.label.toLowerCase() === arg);
        if (!match) {
          return [
            out(`themes: ${THEME_OPTIONS.map((t) => t.label.toLowerCase()).join(', ')}`),
            out("usage: theme <name>"),
          ];
        }
        this.theme.set(match.id as Theme);
        return [out(`Theme set to ${match.label}.`)];
      },
    },
    font: {
      help: 'list or switch typography',
      run: ([arg]) => {
        const match = FONT_OPTIONS.find((f) => f.id === arg);
        if (!match) {
          return [out(`fonts: ${FONT_OPTIONS.map((f) => f.id).join(', ')}`), out('usage: font <name>')];
        }
        this.typography.set(match.id as FontStyle);
        return [out(`Typography set to ${match.label}.`)];
      },
    },
    date: {
      help: 'local time in Bengaluru',
      run: () => [
        out(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short',
          }).format(new Date()) + ' IST',
        ),
      ],
    },
    sudo: {
      help: 'try it',
      run: () => [
        err('vivek is not in the sudoers file. This incident will be reported.'),
        out(`…to his inbox, ideally with a job offer: ${PROFILE.email}`),
      ],
    },
    clear: {
      help: 'clear the screen',
      run: () => {
        this.lines.set([]);
      },
    },
    exit: {
      help: 'back to engineer.yaml',
      run: () => {
        this.exit.emit();
      },
    },
  };

  constructor() {
    // Keep the newest output in view after every render that adds lines.
    afterRenderEffect(() => {
      this.lines();
      const el = this.scroller().nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  focus(): void {
    // A drag-select inside the output should stay a selection.
    if (window.getSelection()?.toString()) return;
    this.input().nativeElement.focus({ preventScroll: true });
  }

  protected onKey(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Enter') {
      const raw = input.value.trim();
      input.value = '';
      this.execute(raw);
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      // Only with something typed — an empty prompt lets Tab move focus on,
      // so keyboard users are never trapped in the terminal.
      event.preventDefault();
      input.value = this.complete(input.value);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.history.length) return;
      const step = event.key === 'ArrowUp' ? -1 : 1;
      this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + step));
      input.value = this.history[this.historyIndex] ?? '';
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      this.lines.set([]);
    }
  }

  private execute(raw: string): void {
    const echo: Line = { text: `vivek@portfolio:~$ ${raw}`, tone: 'cmd' };
    if (!raw) {
      this.lines.update((l) => [...l, echo]);
      return;
    }

    this.history.push(raw);
    this.historyIndex = this.history.length;

    const [name, ...args] = raw.toLowerCase().split(/\s+/);
    const command = this.commands[name];
    this.lines.update((l) => [...l, echo]);

    const result = command
      ? command.run(args)
      : [err(`command not found: ${name} — try 'help'`)];
    if (result) this.lines.update((l) => [...l, ...result, out('')]);
  }

  /** Completes the command name, or the argument for goto/theme/font. */
  private complete(value: string): string {
    const [name, arg = ''] = value.toLowerCase().trimStart().split(/\s+/);
    const pick = (options: string[], typed: string) => {
      const hits = options.filter((o) => o.startsWith(typed));
      if (hits.length > 1) {
        this.lines.update((l) => [...l, out(hits.join('  '))]);
      }
      return hits.length === 1 ? hits[0] : null;
    };

    if (!value.includes(' ')) {
      const hit = pick(Object.keys(this.commands), name);
      return hit ? `${hit} ` : value;
    }

    const args: Record<string, string[]> = {
      goto: SECTIONS,
      theme: THEME_OPTIONS.map((t) => t.label.toLowerCase()),
      font: FONT_OPTIONS.map((f) => f.id),
    };
    const hit = args[name] ? pick(args[name], arg) : null;
    return hit ? `${name} ${hit}` : value;
  }
}
