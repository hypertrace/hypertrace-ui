export const DOMAIN_REGEX = new RegExp(/^.+\.[a-zA-Z]{2,}$/);

export const isDomainValid = (domain: string) => DOMAIN_REGEX.test(domain);

export const areDomainsValid = (domains: string[]) => domains.filter(domain => !isDomainValid(domain)).length === 0;
