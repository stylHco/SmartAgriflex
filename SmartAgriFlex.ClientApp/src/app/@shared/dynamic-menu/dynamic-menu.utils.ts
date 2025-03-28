import {MenuItem} from "primeng/api";

export function getAllMenuItems(...hierarchy: MenuItem[]): Set<MenuItem> {
  const itemsFlattened = new Set<MenuItem>;
  collectMenuItems(hierarchy, itemsFlattened);

  return itemsFlattened;
}

function collectMenuItems(hierarchy: MenuItem[], collector: Set<MenuItem>) {
  for (const item of hierarchy) {
    // Protects against circular graphs
    if (collector.has(item)) continue;

    collector.add(item);

    if (item.items) {
      collectMenuItems(item.items, collector);
    }
  }
}

export function duplicateMenuHierarchy(...hierarchy: MenuItem[]): MenuItem[] {
  const newItems: MenuItem[] = [];

  for (const item of hierarchy) {
    // This seems stupid (vs just using the spread operator) but
    // 1) We want to break all the references and there are nested objects here
    // 2) There is no prototype so we can't programmatically exclude attachments (e.g. MenuUpdatedNotification)
    newItems.push({
      label: item.label,
      icon: item.icon,
      command: item.command,
      url: item.url,
      items: item.items ? duplicateMenuHierarchy(...item.items) : undefined,
      expanded: item.expanded,
      disabled: item.disabled,
      visible: item.visible,
      target: item.target,
      escape: item.escape,
      routerLinkActiveOptions: item.routerLinkActiveOptions,
      separator: item.separator,
      badge: item.badge,
      tooltip: item.tooltip,
      tooltipPosition: item.tooltipPosition,
      badgeStyleClass: item.badgeStyleClass,
      style: item.style,
      styleClass: item.styleClass,
      title: item.title,
      id: item.id,
      automationId: item.automationId,
      tabindex: item.tabindex,
      routerLink: item.routerLink,
      queryParams: item.queryParams ? {...item.queryParams} : undefined,
      fragment: item.fragment,
      queryParamsHandling: item.queryParamsHandling,
      preserveFragment: item.preserveFragment,
      skipLocationChange: item.skipLocationChange,
      replaceUrl: item.replaceUrl,
      iconStyle: item.iconStyle,
      iconClass: item.iconClass,
      state: item.state ? {...item.state} : undefined,
      tooltipOptions: !item.tooltipOptions ? undefined : {
        tooltipLabel: item.tooltipOptions.tooltipLabel,
        tooltipPosition: item.tooltipOptions.tooltipPosition,
        tooltipEvent: item.tooltipOptions.tooltipEvent,
        appendTo: item.tooltipOptions.appendTo,
        positionStyle: item.tooltipOptions.positionStyle,
        tooltipStyleClass: item.tooltipOptions.tooltipStyleClass,
        tooltipZIndex: item.tooltipOptions.tooltipZIndex,
        escape: item.tooltipOptions.escape,
        disabled: item.tooltipOptions.disabled,
        positionTop: item.tooltipOptions.positionTop,
        positionLeft: item.tooltipOptions.positionLeft,
        showDelay: item.tooltipOptions.showDelay,
        hideDelay: item.tooltipOptions.hideDelay,
        life: item.tooltipOptions.life,
      },
    });
  }

  return newItems;
}
