import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core';

@Component({
  selector: 'app-typewriter-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      role="text"
      [attr.aria-label]="prefix + ' ' + currentText"
      [ngStyle]="getContainerStyles()"
      class="typewriter-container"
    >
      @if (prefix) {
        <span [style.color]="prefixColor">{{ prefix }}</span>
      }

      <span aria-hidden="true" [style.color]="color" class="relative">
        {{ displayed }}
        <span
          aria-hidden="true"
          class="cursor-blink"
          [style.opacity]="cursorOn ? 1 : 0"
          [ngStyle]="getCursorStyles()"
        ></span>
      </span>

      <span
        aria-live="polite"
        class="sr-only"
      >
        {{ prefix }} {{ displayed }}
      </span>
    </div>
  `,
  styles: [
    `
    .typewriter-container {
      width: 100%;
      height: 100%;
      white-space: pre-wrap;
    }
    .cursor-blink {
      display: inline-block;
      box-sizing: border-box;
      margin-left: 0.08em;
      vertical-align: -0.08em;
      border-radius: 2px;
      will-change: opacity;
      transition: opacity 0.1s ease;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
  ],
})
export class TypewriterTextComponent implements OnInit, OnDestroy {
  @Input() prefix = '';
  @Input() texts = ['TYPE SEQUENCE'];
  @Input() color = '#FFFFFF';
  @Input() prefixColor = '#FFFFFF';
  @Input() cursorColor = '#FF8D00';
  @Input() cursorBorderColor = '#FF8D00';
  @Input() cursorWidth = 8;
  @Input() cursorHeight = 46;
  @Input() deletingSpeed = 32;
  @Input() typingSpeed = 55;
  @Input() holdDuration = 1800;

  @Input() fontFamily = 'Inter, system-ui, sans-serif';
  @Input() fontWeight: string | number = 700;
  @Input() fontSize = '75px';
  @Input() letterSpacing = '-0.04em';
  @Input() lineHeight = '1.15em';
  @Input() textAlign = 'left';

  textIndex = 0;
  charIndex = 0;
  phase: 'typing' | 'holding' | 'deleting' = 'typing';
  cursorOn = true;

  private timer: ReturnType<typeof setTimeout> | undefined;
  private cursorInterval: ReturnType<typeof setInterval> | undefined;

  get currentText(): string {
    return this.texts[this.textIndex] || '';
  }

  get displayed(): string {
    return this.currentText.slice(0, this.charIndex);
  }

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.startCursorBlink();
    this.scheduleNextTick();
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    clearInterval(this.cursorInterval);
  }

  getContainerStyles() {
    return {
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontSize: this.fontSize,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      textAlign: this.textAlign,
    };
  }

  getCursorStyles() {
    return {
      width: `${this.cursorWidth}px`,
      height: `${this.cursorHeight}px`,
      backgroundColor: this.cursorColor,
      border: `1.5px solid ${this.cursorBorderColor}`,
    };
  }

  private startCursorBlink() {
    this.cursorInterval = setInterval(() => {
      if (this.phase === 'holding') {
        this.cursorOn = !this.cursorOn;
        this.cdr.markForCheck();
      } else {
        if (!this.cursorOn) {
          this.cursorOn = true;
          this.cdr.markForCheck();
        }
      }
    }, 530);
  }

  private scheduleNextTick() {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.charIndex = this.currentText.length;
      this.phase = 'holding';
      this.cdr.markForCheck();
      return;
    }

    if (this.phase === 'typing') {
      if (this.charIndex < this.currentText.length) {
        this.timer = setTimeout(() => {
          this.charIndex++;
          this.cdr.markForCheck();
          this.scheduleNextTick();
        }, this.typingSpeed);
      } else {
        this.phase = 'holding';
        this.timer = setTimeout(() => {
          this.phase = 'deleting';
          this.scheduleNextTick();
        }, this.holdDuration);
      }
    } else if (this.phase === 'deleting') {
      if (this.charIndex > 0) {
        this.timer = setTimeout(() => {
          this.charIndex--;
          this.cdr.markForCheck();
          this.scheduleNextTick();
        }, this.deletingSpeed);
      } else {
        this.textIndex = (this.textIndex + 1) % this.texts.length;
        this.phase = 'typing';
        this.timer = setTimeout(() => {
          this.scheduleNextTick();
        }, 0);
      }
    }
  }
}
