import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  isDevMode,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';

function getFormArray(size: number): FormArray {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(new FormControl(''));
  }
  return new FormArray(arr);
}

@Component({
  selector: 'app-rzm-otp-input',
  templateUrl: './rzm-otp-input.component.html',
  styleUrl: './rzm-otp-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RzmOtpInputComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RzmOtpInputComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RzmOtpInputComponent implements ControlValueAccessor, Validator {
  @Input()
  set size(size: number) {
    this.inputs = getFormArray(size);
    this.#size = size;
  }
  
  @Input() isResetOtpInput: boolean = false;
  @ViewChildren('inputEl') inputEls!: QueryList<ElementRef<HTMLInputElement>>;

  #size = 6;
  #scheduledFocus: number | null = null;

  inputs = getFormArray(this.#size);

  onChange?: (value: string) => void;
  onTouched?: () => void;

  writeValue(value: string): void {
    if (isDevMode() && value?.length) {
      throw new Error('Otp input is not supposed to be prefilled with data');
    }

    // Reset all input values
    this.inputs.setValue(new Array(this.#size).fill(''));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.inputs.disable();
    } else {
      this.inputs.enable();
    }
  }

  validate(control: AbstractControl<string, string>): ValidationErrors | null {
    if (!control.value || control.value.length < this.#size) {
      return {
        otpInput: 'Value is incorrect',
      };
    }

    return null;
  }

  handleKeyDown(e: KeyboardEvent, idx: number) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Prevent default behavior
      e.preventDefault();

      // If the current input is empty and Backspace/Delete is pressed,
      // clear the content of the previous input and move the focus to it
      if (!this.inputs.controls[idx].value) {
        if (idx > 0) {
          // Clear the content of the previous input
          this.inputs.controls[idx - 1].setValue('');
          // Move the focus to the previous input
          this.#focusInput(idx - 1);
        }
      } else {
        // If the current input is not empty, just clear its content
        this.inputs.controls[idx].setValue('');
      }

      // Update the value of the form control
      this.#updateWiredValue();
    }
  }

  handleInput() {
    this.#updateWiredValue();

    if (this.#scheduledFocus != null) {
      this.#focusInput(this.#scheduledFocus);
      this.#scheduledFocus = null;
    }
  }

  handleKeyPress(e: KeyboardEvent, idx: number) {
    const isDigit = /\d/.test(e.key);

    // Safari fires Cmd + V through keyPress event as well
    // so we need to handle it here and let it through
    if (e.key === 'v' && e.metaKey) {
      return true;
    }

    if (isDigit && idx + 1 < this.#size && !this.inputs.controls[idx].value) {
      // If user inputs digits & we are not on the last input and the current input is not filled,
      // we want to advance the focus
      this.#scheduledFocus = idx + 1;
    } else if (
      isDigit &&
      idx === this.#size - 1 &&
      this.inputs.controls[idx].value
    ) {
      // If the current input is the last one and it's already filled, prevent further input
      e.preventDefault();
      return false;
    }

    if (isDigit && this.inputs.controls[idx].value) {
      // If user deselects an input which already has a value
      // we want to clear it so that it doesn't have more than 1 digit
      this.inputs.controls[idx].setValue('');
    }

    return isDigit;
  }

  handlePaste(e: ClipboardEvent, idx: number) {
    e.preventDefault();

    if (idx !== 0) {
      // If the target input is not the first one - ignore
      return;
    }

    const pasteData = e.clipboardData?.getData('text');
    const regex = new RegExp(`\\d{1,${this.#size}}`); // Adjust the regex to accept 1 to #size characters

    if (!pasteData || !regex.test(pasteData)) {
      // If there is nothing to be pasted or the pasted data does not
      // comply with the required format - ignore the event
      return;
    }

    // Take only the first #size characters from the pasted data
    const truncatedData = pasteData.slice(0, this.#size);

    for (let i = 0; i < truncatedData.length; i++) {
      this.inputs.controls[i].setValue(truncatedData[i]);
    }

    this.#focusInput(this.inputEls.length - 1);
    this.#updateWiredValue();
    if (this.onTouched) {
      this.onTouched();
    }
  }

  handleChange(e: Event, idx: number) {
    const input = e.target as HTMLInputElement;
    const value = input.value;

    this.#updateWiredValue();

    if (this.#scheduledFocus != null) {
      this.#focusInput(this.#scheduledFocus);
      this.#scheduledFocus = null;
    }

    if (!value) {
      // Handle the case where the input value is empty
      e.preventDefault();
      return;
    }

    // Check if the input value length is greater than 1
    if (value.trim().length > 1) {
      // Manually create a ClipboardEvent object with the input value
      const clipboardEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      clipboardEvent.clipboardData?.setData('text/plain', value.trim());

      // Call the handlePaste function with the created ClipboardEvent
      this.handlePaste(clipboardEvent, 0);
    } else {
      // Move focus to the next input
      if (idx + 1 < this.#size) {
        this.#focusInput(idx + 1);
      }
    }
  }

  handleFocus(e: FocusEvent) {
    // Select previously entered value to replace with a new input
    (e.target as HTMLInputElement).select();
  }

  #focusInput(idx: number) {
    // In order not to interfere with the input we setTimeout
    // before advancing the focus
    setTimeout(() => this.inputEls.get(idx)?.nativeElement.focus());
  }

  #updateWiredValue() {
    // We want to expose the value as a plain string
    //
    // In order not to interfere with the input we setTimeout
    // before advancing the focus
    setTimeout(() => this.onChange?.(this.inputs.value.join('')));
  }
}
