import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { __decorate } from 'tslib';

let TypewriterTextComponent = class TypewriterTextComponent {
  prefix = '';
  texts = ['TYPE SEQUENCE'];
  color = '#FFFFFF';
  prefixColor = '#FFFFFF';
  cursorColor = '#FF8D00';
  cursorBorderColor = '#FF8D00';
  cursorWidth = 8;
  cursorHeight = 46;
  deletingSpeed = 32;
  typingSpeed = 55;
  holdDuration = 1800;
  fontFamily = 'Inter, system-ui, sans-serif';
  fontWeight = 700;
  fontSize = '75px';
  letterSpacing = '-0.04em';
  lineHeight = '1.15em';
  textAlign = 'left';
  textIndex = 0;
  charIndex = 0;
  phase = 'typing';
  cursorOn = true;
  timer;
  cursorInterval;
  get currentText() {
    return this.texts[this.textIndex] || '';
  }
  get displayed() {
    return this.currentText.slice(0, this.charIndex);
  }
  cdr = inject(ChangeDetectorRef);
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
  startCursorBlink() {
    this.cursorInterval = setInterval(() => {
      if (this.phase === 'holding') {
        this.cursorOn = !this.cursorOn;
        this.cdr.markForCheck();
      } else if (!this.cursorOn) {
        this.cursorOn = true;
        this.cdr.markForCheck();
      }
    }, 530);
  }
  scheduleNextTick() {
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
};
__decorate([Input()], TypewriterTextComponent.prototype, 'prefix', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'texts', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'color', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'prefixColor', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'cursorColor', void 0);
__decorate(
  [Input()],
  TypewriterTextComponent.prototype,
  'cursorBorderColor',
  void 0,
);
__decorate([Input()], TypewriterTextComponent.prototype, 'cursorWidth', void 0);
__decorate(
  [Input()],
  TypewriterTextComponent.prototype,
  'cursorHeight',
  void 0,
);
__decorate(
  [Input()],
  TypewriterTextComponent.prototype,
  'deletingSpeed',
  void 0,
);
__decorate([Input()], TypewriterTextComponent.prototype, 'typingSpeed', void 0);
__decorate(
  [Input()],
  TypewriterTextComponent.prototype,
  'holdDuration',
  void 0,
);
__decorate([Input()], TypewriterTextComponent.prototype, 'fontFamily', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'fontWeight', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'fontSize', void 0);
__decorate(
  [Input()],
  TypewriterTextComponent.prototype,
  'letterSpacing',
  void 0,
);
__decorate([Input()], TypewriterTextComponent.prototype, 'lineHeight', void 0);
__decorate([Input()], TypewriterTextComponent.prototype, 'textAlign', void 0);
TypewriterTextComponent = __decorate(
  [
    Component({
      selector: 'app-typewriter-text',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './typewriter-text.component.html',
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
    }),
  ],
  TypewriterTextComponent,
);

export { TypewriterTextComponent };
