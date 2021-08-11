import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconRegistryService, SvgIconRegistrationInfo } from './icon-registry.service';
import { IconType } from './icon-type';

export const SVG_ICONS = new InjectionToken<SvgIconRegistrationInfo[]>('SVG_ICONS');

const iconsRootPath = 'assets/icons';

@NgModule({
  imports: [MatIconModule],
  providers: [
    {
      provide: SVG_ICONS,
      multi: true,
      useValue: [
        { key: IconType.Alarm, url: `${iconsRootPath}/alarm.svg` },
        { key: IconType.Alert, url: `${iconsRootPath}/alert.svg` },
        { key: IconType.ArrowDown, url: `${iconsRootPath}/arrow-down.svg` },
        { key: IconType.ArrowDownLeft, url: `${iconsRootPath}/arrow-down-left.svg` },
        { key: IconType.ArrowDownRight, url: `${iconsRootPath}/arrow-down-right.svg` },
        { key: IconType.ArrowLeft, url: `${iconsRootPath}/arrow-left.svg` },
        { key: IconType.ArrowRight, url: `${iconsRootPath}/arrow-right.svg` },
        { key: IconType.ArrowUp, url: `${iconsRootPath}/arrow-up.svg` },
        { key: IconType.ArrowUpLeft, url: `${iconsRootPath}/arrow-up-left.svg` },
        { key: IconType.ArrowUpRight, url: `${iconsRootPath}/arrow-up-right.svg` },
        { key: IconType.Calls, url: `${iconsRootPath}/calls.svg` },
        { key: IconType.CheckCircle, url: `${iconsRootPath}/check-circle.svg` },
        { key: IconType.CheckCircleFill, url: `${iconsRootPath}/check-circle-fill.svg` },
        { key: IconType.ChevronDown, url: `${iconsRootPath}/chevron-down.svg` },
        { key: IconType.ChevronLeft, url: `${iconsRootPath}/chevron-left.svg` },
        { key: IconType.ChevronRight, url: `${iconsRootPath}/chevron-right.svg` },
        { key: IconType.ChevronUp, url: `${iconsRootPath}/chevron-up.svg` },
        { key: IconType.Close, url: `${iconsRootPath}/close.svg` },
        { key: IconType.CloseCircle, url: `${iconsRootPath}/close-circle.svg` },
        { key: IconType.CloseCircleFilled, url: `${iconsRootPath}/close-circle-filled.svg` },
        { key: IconType.Code, url: `${iconsRootPath}/code.svg` },
        { key: IconType.CollapseAll, url: `${iconsRootPath}/collapse-all.svg` },
        { key: IconType.Collapsed, url: `${iconsRootPath}/plus-square.svg` },
        { key: IconType.Compare, url: `${iconsRootPath}/compare.svg` },
        { key: IconType.Custom, url: `${iconsRootPath}/custom.svg` },
        { key: IconType.Dashboard, url: `${iconsRootPath}/dashboard.svg` },
        { key: IconType.Device, url: `${iconsRootPath}/device.svg` },
        { key: IconType.Download, url: `${iconsRootPath}/download.svg` },
        { key: IconType.Edge, url: `${iconsRootPath}/edge.svg` },
        { key: IconType.ExpandAll, url: `${iconsRootPath}/expand-all.svg` },
        { key: IconType.Expanded, url: `${iconsRootPath}/minus-circle.svg` },
        { key: IconType.ExpandedReverse, url: `${iconsRootPath}/minus-circle-reverse.svg` },
        { key: IconType.External, url: `${iconsRootPath}/external.svg` },
        { key: IconType.ExternalApi, url: `${iconsRootPath}/external-api.svg` },
        { key: IconType.Eye, url: `${iconsRootPath}/eye.svg` },
        { key: IconType.FileCode, url: `${iconsRootPath}/file-code.svg` },
        { key: IconType.Filter, url: `${iconsRootPath}/filter.svg` },
        { key: IconType.Go, url: `${iconsRootPath}/go.svg` },
        { key: IconType.Helm, url: `${iconsRootPath}/helm.svg` },
        { key: IconType.Hypertrace, url: `${iconsRootPath}/hypertrace.svg` },
        { key: IconType.IpAddress, url: `${iconsRootPath}/ip-address.svg` },
        { key: IconType.Info, url: `${iconsRootPath}/info.svg` },
        { key: IconType.Infrastructure, url: `${iconsRootPath}/infrastructure.svg` },
        { key: IconType.Internal, url: `${iconsRootPath}/internal.svg` },
        { key: IconType.InternalApi, url: `${iconsRootPath}/internal-api.svg` },
        { key: IconType.Istio, url: `${iconsRootPath}/istio.svg` },
        { key: IconType.Java, url: `${iconsRootPath}/java.svg` },
        { key: IconType.KnowledgeGraph, url: `${iconsRootPath}/knowledge-graph.svg` },
        { key: IconType.Kong, url: `${iconsRootPath}/kong.svg` },
        { key: IconType.Kubernetes, url: `${iconsRootPath}/kubernetes.svg` },
        { key: IconType.LightBulb, url: `${iconsRootPath}/light-bulb.svg` },
        { key: IconType.LinkUrl, url: `${iconsRootPath}/link-url.svg` },
        { key: IconType.Loading, url: `${iconsRootPath}/loading.svg` },
        { key: IconType.MoreHorizontal, url: `${iconsRootPath}/more-horizontal.svg` },
        { key: IconType.MoreVertical, url: `${iconsRootPath}/more-vertical.svg` },
        { key: IconType.NoData, url: `${iconsRootPath}/no-data.svg` },
        { key: IconType.Node, url: `${iconsRootPath}/node.svg` },
        { key: IconType.Note, url: `${iconsRootPath}/note.svg` },
        { key: IconType.OpenInNewTab, url: `${iconsRootPath}/open-in-new-tab.svg` },
        { key: IconType.Protocol, url: `${iconsRootPath}/protocol.svg` },
        { key: IconType.Python, url: `${iconsRootPath}/python.svg` },
        { key: IconType.Search, url: `${iconsRootPath}/search.svg` },
        { key: IconType.SidebarCollapse, url: `${iconsRootPath}/sidebar-collapse.svg` },
        { key: IconType.SidebarExpand, url: `${iconsRootPath}/sidebar-expand.svg` },
        { key: IconType.Sort, url: `${iconsRootPath}/sort.svg` },
        { key: IconType.Slack, url: `${iconsRootPath}/slack.svg` },
        { key: IconType.Spinner, url: `${iconsRootPath}/spinner.svg` },
        { key: IconType.StatusCode, url: `${iconsRootPath}/status-code.svg` },
        { key: IconType.TraceId, url: `${iconsRootPath}/trace-id.svg` },
        { key: IconType.TriangleDown, url: `${iconsRootPath}/triangle-down.svg` },
        { key: IconType.TriangleLeft, url: `${iconsRootPath}/triangle-left.svg` },
        { key: IconType.TriangleRight, url: `${iconsRootPath}/triangle-right.svg` },
        { key: IconType.TriangleUp, url: `${iconsRootPath}/triangle-up.svg` },
        { key: IconType.Yaml, url: `${iconsRootPath}/yaml.svg` },
        { key: IconType.VirtualMachine, url: `${iconsRootPath}/virtual-machine.svg` },
        { key: IconType.Warning, url: `${iconsRootPath}/warning.svg` }
      ]
    }
  ]
})
// tslint:disable-next-line: no-unnecessary-class
export class IconLibraryModule {
  public constructor(
    iconRegistryService: IconRegistryService,
    @Inject(SVG_ICONS) iconRegistrationInfo: SvgIconRegistrationInfo[][]
  ) {
    iconRegistrationInfo.flat().forEach(iconInfo => iconRegistryService.registerSvgIcon(iconInfo));
  }

  public static withIcons(iconRegistrationInfo: SvgIconRegistrationInfo[]): ModuleWithProviders<IconLibraryModule> {
    return {
      ngModule: IconLibraryModule,
      providers: [
        {
          provide: SVG_ICONS,
          useValue: iconRegistrationInfo,
          multi: true
        }
      ]
    };
  }
}
