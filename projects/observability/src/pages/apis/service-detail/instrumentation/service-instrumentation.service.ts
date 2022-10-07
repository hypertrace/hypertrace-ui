import { Injectable } from '@angular/core';
import { InstrumentationQualityService } from '@hypertrace/common';
import { BehaviorSubject, Observable } from 'rxjs';

import { OrgScoreResponse, ServiceScoreResponse } from './service-instrumentation.types';

@Injectable()
export class ServiceInstrumentationService {
  public serviceScoreSubject: BehaviorSubject<ServiceScoreResponse | undefined> = new BehaviorSubject<
    ServiceScoreResponse | undefined
  >(undefined);

  public constructor(private readonly queryService: InstrumentationQualityService) {}

  public getServiceScore(serviceName: string): Observable<ServiceScoreResponse> {
    // Return of({ ...serviceScoreResponse, serviceName: serviceName }).pipe(delay(1000)); // mock
    return this.queryService.getServiceScore<ServiceScoreResponse>(`/${serviceName}`);
  }

  public getOrgScore(): Observable<OrgScoreResponse> {
    // Return of(orgScoreResponse); // mock
    return this.queryService.getOrgScore<OrgScoreResponse>();
  }

  public getLabelForScore(score: number): string {
    if (score < 50) {
      return 'Below Expectation';
    }

    if (score < 70) {
      return 'Need Improvement';
    }

    if (score < 90) {
      return 'Good';
    }

    return 'Excellent!';
  }

  public getColorForScore(score: number): { light: string; dark: string } {
    // Shades taken from Radix Colors
    if (score < 50) {
      return {
        light: '#ffe5e5', // Red4
        dark: '#dc3d43' // Red10
      };
    }

    if (score < 70) {
      return {
        light: '#ffecbc', // Amber4
        dark: '#ffa01c' // Amber10
      };
    }

    return {
      light: '#dff3df', // Grass4
      dark: '#3d9a50' // Grass10
    };
  }

  public getDescriptionForScore(score: number): string {
    if (score < 50) {
      return 'Attention is needed to improve the instrumentation of this service so you can start gaining valuable insights from Hypertrace.';
    }

    if (score < 70) {
      return 'There is considerable scope for improvement. Please see the sections below to learn how to improve the instrumentation of this service.';
    }

    if (score < 90) {
      return 'This service has good instrumentation, but you can still make improvements to gain more valuable insights from Hypertrace.';
    }

    return 'Great job! This service has been instrumented using best practices.';
  }
}
