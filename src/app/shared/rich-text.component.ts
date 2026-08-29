import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Segment = { text: string; bold: boolean };

/**
 * Renders `**bold**` emphasis inside a plain content string.
 *
 * Deliberately does NOT use innerHTML — the string is split into segments and
 * rendered as real text nodes, so there is no sanitiser bypass anywhere in
 * the app even though all content is first-party.
 *
 *   <app-rich [text]="bullet.text" />
 */
@Component({
  selector: 'app-rich',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Written on a single line on purpose. Angular only strips text nodes that
  // are *entirely* whitespace, so pretty-printing this template would fold the
  // surrounding newlines into each segment and produce "Etisalat , where"
  // instead of "Etisalat, where".
  // prettier-ignore
  template: `@for (seg of segments(); track $index) {@if (seg.bold) {<strong class="font-medium text-ink">{{ seg.text }}</strong>} @else {<span>{{ seg.text }}</span>}}`,
})
export class RichTextComponent {
  readonly text = input.required<string>();

  readonly segments = computed<Segment[]>(() =>
    this.text()
      .split(/(\*\*[^*]+\*\*)/g)
      .filter((part) => part.length > 0)
      .map((part) =>
        part.startsWith('**') && part.endsWith('**')
          ? { text: part.slice(2, -2), bold: true }
          : { text: part, bold: false },
      ),
  );
}
