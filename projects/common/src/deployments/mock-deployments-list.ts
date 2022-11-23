/* tslint:disable */
import { DeploymentsResponse } from './deployment.types';

export const mockResponse: DeploymentsResponse = {
  payload: {
    service: 'api',
    deployments: [
      {
        type: 'app',
        commit: '2a472961e419e1d8ad52b5d10d3366a9f875154f',
        status: 'TERMINAL',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666954674000,
        endTime: 1666954740000,
        commitLink: 'https://github.com/razorpay/api/commit/2a472961e419e1d8ad52b5d10d3366a9f875154f',
        prDetails: [
          {
            event_id: 'KZARTt0y4r5WFu',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33731',
            pr_title: 'convert bank acc no. to string in product config API',
            author: 'shwatang',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: '4ce536811135cb92f14b76b1c5f9b30b8d39fa45',
        status: 'TERMINAL',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666875301000,
        endTime: 1666875369000,
        commitLink: 'https://github.com/razorpay/api/commit/4ce536811135cb92f14b76b1c5f9b30b8d39fa45',
        prDetails: [
          {
            event_id: 'KYnx5zoj8mXFZf',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33768',
            pr_title: 'added changes',
            author: 'vamshi0322',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: '4ce536811135cb92f14b76b1c5f9b30b8d39fa45',
        status: 'TERMINAL',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666845005000,
        endTime: 1666880481000,
        commitLink: 'https://github.com/razorpay/api/commit/4ce536811135cb92f14b76b1c5f9b30b8d39fa45',
        prDetails: [
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33479',
            pr_title: 'Terminal downtime event changes',
            author: 'akshaygupta475',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33641',
            pr_title: 'M2 Filters',
            author: 'umakantv',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33714',
            pr_title: 'update External Order fixes',
            author: 'meghashah10',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33762',
            pr_title: 'CDS: Test case fix',
            author: 'aawas1',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33755',
            pr_title: 'remove emandate duplicate payments razorx',
            author: 'nikhil-rzp',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33663',
            pr_title: 'dual write implemented for customer transfer',
            author: 'meghashah10',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33768',
            pr_title: 'added changes',
            author: 'vamshi0322',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYfGO4HWDJoy5s',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33756',
            pr_title: 'fix merchant region issue',
            author: 'shivavishaal66215',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: 'f81bab48ab7db291155f26686f41ab35eb463380',
        status: 'CANCELED',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666758603000,
        endTime: 1666758765000,
        commitLink: 'https://github.com/razorpay/api/commit/f81bab48ab7db291155f26686f41ab35eb463380',
        prDetails: [
          {
            event_id: 'KYGtmYuPd71tiw',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33632',
            pr_title:
              'EAX-247 | EAX-240 | EAX-236 : fix: undefined index impersonation for partner credential integrations without impersonation',
            author: 'rishabh-gupta2',
            jira_id: 'https://razorpay.atlassian.net/browse/EAX-247'
          }
        ]
      },
      {
        type: 'app',
        commit: 'f81bab48ab7db291155f26686f41ab35eb463380',
        status: 'CANCELED',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666758603000,
        endTime: 1666758765000,
        commitLink: 'https://github.com/razorpay/api/commit/f81bab48ab7db291155f26686f41ab35eb463380',
        prDetails: [
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33604',
            pr_title: 'PLAT-89 adding outbox job for commission sync',
            author: 'varunmeka',
            jira_id: 'https://razorpay.atlassian.net/browse/PLAT-89'
          },
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33717',
            pr_title: 'change application status to picked on FD ticket',
            author: 'shivavishaal66215',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33573',
            pr_title: 'Configure route level timeout for ASV Sync Deviation Route',
            author: 'Dilipchauhan1998',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33736',
            pr_title: 'try fix tc',
            author: 'aawas1',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33632',
            pr_title:
              'EAX-247 | EAX-240 | EAX-236 : fix: undefined index impersonation for partner credential integrations without impersonation',
            author: 'rishabh-gupta2',
            jira_id: 'https://razorpay.atlassian.net/browse/EAX-247'
          },
          {
            event_id: 'KYGjB03pkiiUy4',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33753',
            pr_title: 'CE-6878: Log Create \u0026 Close Checkout Order Requests',
            author: 'rishi-ramawat',
            jira_id: 'https://razorpay.atlassian.net/browse/CE-6878'
          }
        ]
      },
      {
        type: 'app',
        commit: 'e4f2505be62a9ddc21b50bf0a33f2c8ccd785e0c',
        status: 'TERMINAL',
        triggeredBy: 'NarasimhaSwamy',
        startTime: 1666716150000,
        endTime: 1666716205000,
        commitLink: 'https://github.com/razorpay/api/commit/e4f2505be62a9ddc21b50bf0a33f2c8ccd785e0c',
        prDetails: [
          {
            event_id: 'KY4nqKAha8pp3i',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33479',
            pr_title: 'Terminal downtime event changes',
            author: 'akshaygupta475',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: 'e4f2505be62a9ddc21b50bf0a33f2c8ccd785e0c',
        status: 'SUCCEEDED',
        triggeredBy: 'zaheerbasha',
        startTime: 1666716018000,
        endTime: 1666717363000,
        commitLink: 'https://github.com/razorpay/api/commit/e4f2505be62a9ddc21b50bf0a33f2c8ccd785e0c',
        prDetails: [
          {
            event_id: 'KY4nodKTuvnxFW',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33479',
            pr_title: 'Terminal downtime event changes',
            author: 'akshaygupta475',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: 'cc17ecd207e13ffde61acd2efb7aef88793b369e',
        status: 'CANCELED',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666585803000,
        endTime: 1666593502000,
        commitLink: 'https://github.com/razorpay/api/commit/cc17ecd207e13ffde61acd2efb7aef88793b369e',
        prDetails: [
          {
            event_id: 'KXVsGDXTUuuzhj',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33702',
            pr_title: 'prevent archival of activated banking_account via batch',
            author: 'shivavishaal66215',
            jira_id: 'JIRA not linked'
          }
        ]
      },
      {
        type: 'app',
        commit: 'cc17ecd207e13ffde61acd2efb7aef88793b369e',
        status: 'CANCELED',
        triggeredBy: 'c6f7a768-ca90-40da-ad0f-fda5bde0c6bb@managed-service-account',
        startTime: 1666585803000,
        endTime: 1666593502000,
        commitLink: 'https://github.com/razorpay/api/commit/cc17ecd207e13ffde61acd2efb7aef88793b369e',
        prDetails: [
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33574',
            pr_title: 'add feature checks in free payout migration route',
            author: 'mukesh0513',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33512',
            pr_title: 'Use iin from vault instead of from card iin',
            author: 'harijvs6',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33652',
            pr_title: 'fix for ICIC paylater routing rules',
            author: 'harijvs6',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/32962',
            pr_title: 'CDS Pricing',
            author: 'aawas1',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33709',
            pr_title: 'CE-6481: Add merchant_brand_name in preferences API',
            author: 'saikiransaindla2',
            jira_id: 'https://razorpay.atlassian.net/browse/CE-6481'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33624',
            pr_title: '[NOCODE] robots.txt endpoint for pages.razorpay.com',
            author: 'razorpay-sanjib',
            jira_id: 'JIRA not linked'
          },
          {
            event_id: 'KXTf2DOXwEysD8',
            application: 'api                     ',
            pr_link: 'https://github.com/razorpay/api/pull/33702',
            pr_title: 'prevent archival of activated banking_account via batch',
            author: 'shivavishaal66215',
            jira_id: 'JIRA not linked'
          }
        ]
      }
    ]
  },
  success: true,
  errors: null
};
