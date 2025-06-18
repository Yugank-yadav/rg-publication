import { getProductById } from "../../../data/products";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found | RG Publication",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.title} | RG Publication`,
    description: product.description,
    keywords: [
      product.subject,
      `Class ${product.class}`,
      product.type,
      "educational books",
      "RG Publication",
      ...product.tags,
    ].join(", "),
    openGraph: {
      title: product.title,
      description: product.subtitle || product.description,
      type: "website",
      images: [
        {
          url: `/api/og-image?title=${encodeURIComponent(
            product.title
          )}&subject=${product.subject}&class=${product.class}`,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      siteName: "RG Publication",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.subtitle || product.description,
      images: [
        `/api/og-image?title=${encodeURIComponent(product.title)}&subject=${
          product.subject
        }&class=${product.class}`,
      ],
    },
    alternates: {
      canonical: `/shop/${product.id}`,
    },
  };
}

export default function ProductLayout({ children }) {
  return children;
}
