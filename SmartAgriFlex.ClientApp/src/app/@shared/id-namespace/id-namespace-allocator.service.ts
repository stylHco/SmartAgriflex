import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdNamespaceAllocatorService {
  private nextNamespace: number = -1;

  public allocateNamespace(): string {
    this.nextNamespace++;
    return `___${this.nextNamespace}___`;
  }
}
