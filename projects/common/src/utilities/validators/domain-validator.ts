export const DOMAIN_REGEX = new RegExp(
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

export const isDomainValid = (domain: string) => {
  return DOMAIN_REGEX.test(domain);
};

export const areDomainsValid = (domains: string[]) => domains.filter(domain => !isDomainValid(domain)).length === 0;
