import {Injectable} from '@angular/core';
import {MessageService} from "primeng/api";
import {BasicToastContent} from "./toast-content";

export type BasicToastSeverity = 'info' | 'success' | 'warn' | 'error';

@Injectable({
  providedIn: 'root'
})
export class CommonToastsService {
  constructor(
    private readonly messageService: MessageService,
  ) {
  }

  public showBasicInfo(content: BasicToastContent): void {
    this.showBasic('info', content);
  }

  public showBasicSuccess(content: BasicToastContent): void {
    this.showBasic('success', content);
  }

  public showBasicWarning(content: BasicToastContent): void {
    this.showBasic('warn', content);
  }

  public showBasicError(content: BasicToastContent): void {
    this.showBasic('error', content);
  }

  public showBasic(severity: BasicToastSeverity, content: BasicToastContent): void {
    this.messageService.add({...content, severity});
  }
}
