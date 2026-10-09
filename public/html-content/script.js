(async () => {
  const REPO = "SimphiweNkabinde/sveltia-cms";

  const params = new URLSearchParams(location.search);
  const collectionName = params.get("collection");
  const slug = params.get("slug");
  const fieldName = params.get("field");

  const url = `https://raw.githubusercontent.com/${REPO}/main/content/${collectionName}/${slug}.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const text = await res.text();
  const parsedData = jsyaml.loadAll(text);
  if (parsedData.length) {
    document.documentElement.innerHTML = parsedData[0][fieldName].code;
  }
})();
