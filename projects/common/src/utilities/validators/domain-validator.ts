export const DOMAIN_REGEX = new RegExp(/^[a-z0-9\-]{3,}\.[a-z]{2,}$/);

export const isDomainValid = (domain: string) => {
  return DOMAIN_REGEX.test(domain);
};

export const areDomainsValid = (domains: string[]) => domains.filter(domain => !isDomainValid(domain)).length === 0;
