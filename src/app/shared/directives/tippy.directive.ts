import {
  Directive,
  type ElementRef,
  Input,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  type SimpleChanges,
} from '@angular/core';
import tippy, { type Instance, type Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

@Directive({
  selector: '[vhTippy]',
  standalone: true,
})
export class TippyDirective implements OnInit, OnChanges, OnDestroy {
  @Input('vhTippy') content: string | undefined = '';
  @Input() tippyOptions: Partial<Props> = {};

  private instance: Instance<Props> | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initTippy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && !changes['content'].firstChange) {
      // Update content if instance already exists
      if (this.instance) {
        this.instance.setContent(this.content || '');
      } else {
        this.initTippy();
      }
    }
  }

  private initTippy() {
    if (this.content) {
      const result = tippy(this.el.nativeElement, {
        content: this.content,
        allowHTML: true,
        placement: 'top',
        interactive: false,
        ...this.tippyOptions,
      });

      // tippy() returns Instance or Instance[] - get first if array
      this.instance = Array.isArray(result) ? result[0] : result;
    }
  }

  ngOnDestroy() {
    if (this.instance) {
      this.instance.destroy();
    }
  }
}
