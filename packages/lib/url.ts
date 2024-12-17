import type {A} from 'ts-toolbelt';

type IsParameter<Part> = Part extends `{${infer ParamName}}` ? ParamName : never;
type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;

export type Args<Path> = {
  [Key in FilteredParts<Path>]: string | number;
};

const baseUrl = 'http://example.com';

/**
 * DOESN'T WORK WITH RELATIVE URLS WHEN params are provided
 */
export function urlWithArgs<P extends string>(
  url: P,
  args: A.Compute<Partial<Args<P>>, 'flat'>,
  {rql, ...params}: Partial<Record<string | 'rql', string | number | undefined | string[]>> = {}
): P {
  let newUrl = url.replace(/{(\w+)}/g, (_, key: string) => (args as any)[key]?.toString() ?? '');
  if (!params) return newUrl as P;

  const urlObj = new URL(newUrl, baseUrl);

  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach((v) => urlObj.searchParams.append(key, v.toString()));
    } else if (val) {
      urlObj.searchParams.set(key, val.toString());
    }
  }

  newUrl = urlObj.toString().replace(new RegExp(`^${baseUrl}`), '');

  if (!rql) {
    return newUrl as P;
  }

  if (newUrl.includes('?')) {
    newUrl = `${newUrl}&${rql}`;
  } else {
    newUrl = `${newUrl}?${rql}`;
  }
  return newUrl as P;
}

export function processPortalURL(requestUrl: string, mainUrl: string, tenantSlug: string) {
  const prMatch = requestUrl.match(/https:\/\/(pr-[a-zA-Z0-9.-]+)\//i);
  if (prMatch) {
    const prDomain = prMatch[1].replace(/(\.staging)?\.app\.hirecinch\.com/, '');
    const updatedURL = mainUrl.replace('PR', prDomain).replace('TENANT', tenantSlug);
    return updatedURL;
  }

  return mainUrl.replace('TENANT', tenantSlug);
}
