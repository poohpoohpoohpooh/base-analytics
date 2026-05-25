import type { RankName } from "@/lib/rank";

type DownloadCardOptions = {
  rank: RankName;
  generatedAt?: string;
};

export async function downloadElementAsPng(
  element: HTMLElement,
  options: DownloadCardOptions
) {
  await waitForStableCard(element);
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#020617",
    filter: (node) =>
      !(node instanceof HTMLElement && node.dataset.noCapture === "true")
  });
  const link = document.createElement("a");
  const date = formatFileDate(options.generatedAt);
  const rankSlug = options.rank.toLowerCase().replace(/\s+/g, "-");

  link.href = dataUrl;
  link.download = `base-identity-${rankSlug}-${date}.png`;
  link.click();
}

async function waitForStableCard(element: HTMLElement) {
  await document.fonts?.ready;
  const images = Array.from(element.querySelectorAll("img"));
  const backgroundUrls = collectBackgroundImageUrls(element);

  await Promise.all(
    [
      ...images.map((image) => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }),
      ...backgroundUrls.map(loadImageUrl)
    ]
  );
}

function collectBackgroundImageUrls(element: HTMLElement): string[] {
  const elements = [element, ...Array.from(element.querySelectorAll<HTMLElement>("*"))];
  const urls = new Set<string>();

  for (const node of elements) {
    const backgroundImage = window.getComputedStyle(node).backgroundImage;
    const matches = backgroundImage.matchAll(/url\((['"]?)(.*?)\1\)/g);

    for (const match of matches) {
      if (match[2]) {
        urls.add(match[2]);
      }
    }
  }

  return Array.from(urls);
}

function loadImageUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

function formatFileDate(value: string | undefined): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}
