import type { AdminProduct, Collection as AdminCollection } from './adminData';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '');

export type ApiProduct = {
  id: string;
  name: string;
  nameVi: string;
  category: string;
  categoryVi: string;
  price: string;
  description?: string | null;
  descriptionVi?: string | null;
  image: string;
  imagePublicId?: string | null;
  garment?: string | null;
  region?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImageUsage = 'gallery' | 'try_on';

export type ApiProductImage = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
  isGallery: boolean;
  usage: ProductImageUsage;
  tryOnSize?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
  product?: ApiProduct;
};

export type UploadProductImageResponse = {
  image: ApiProductImage;
  product: ApiProduct;
};

export type UploadCollectionCoverImageResponse = {
  coverImage: string;
};

export type AdminCollectionPayload = {
  id?: string;
  name: string;
  description: string;
  coverImage: string;
  status: AdminCollection['status'];
  productCount: number;
};

export type AdminProductPayload = {
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  status: AdminProduct['status'];
};

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const response = await fetch(`${apiBaseUrl}/products/admin`);

  if (!response.ok) {
    throw new Error(`API sản phẩm trả về mã ${response.status}`);
  }

  const products = (await response.json()) as ApiProduct[];
  return products.map(toAdminProduct);
}

export async function saveAdminProduct(
  product: AdminProductPayload,
): Promise<AdminProduct> {
  const { id, ...body } = product;
  const response = await fetch(
    id ? `${apiBaseUrl}/products/${id}` : `${apiBaseUrl}/products`,
    {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: body.name,
        nameVi: body.name,
        category: body.category,
        categoryVi: body.category,
        price: String(body.price),
        description: body.description,
        descriptionVi: body.description,
        image: body.image,
        isActive: body.status === 'active',
      }),
    },
  );

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return toAdminProduct((await response.json()) as ApiProduct);
}

export async function uploadProductImage({
  productId,
  file,
  altText,
  isPrimary,
  isGallery,
  usage,
  tryOnSize,
}: {
  productId: string;
  file: File;
  altText?: string;
  isPrimary?: boolean;
  isGallery?: boolean;
  usage?: ProductImageUsage;
  tryOnSize?: string;
}): Promise<UploadProductImageResponse> {
  const formData = new FormData();
  formData.append('image', file);

  if (altText) {
    formData.append('altText', altText);
  }

  if (isPrimary !== undefined) {
    formData.append('isPrimary', String(isPrimary));
  }

  if (isGallery !== undefined) {
    formData.append('isGallery', String(isGallery));
  }

  if (usage) {
    formData.append('usage', usage);
  }

  if (tryOnSize) {
    formData.append('tryOnSize', tryOnSize);
  }

  const response = await fetch(`${apiBaseUrl}/products/${productId}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return (await response.json()) as UploadProductImageResponse;
}

export async function fetchProductImages(
  productId: string,
): Promise<ApiProductImage[]> {
  const response = await fetch(`${apiBaseUrl}/products/${productId}/images`);

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return (await response.json()) as ApiProductImage[];
}

export async function fetchProductTryOnImages(): Promise<ApiProductImage[]> {
  const response = await fetch(`${apiBaseUrl}/products/try-on`);

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return (await response.json()) as ApiProductImage[];
}

export async function updateProductImage({
  productId,
  imageId,
  altText,
  isPrimary,
  isGallery,
  usage,
  tryOnSize,
  position,
}: {
  productId: string;
  imageId: string;
  altText?: string;
  isPrimary?: boolean;
  isGallery?: boolean;
  usage?: ProductImageUsage;
  tryOnSize?: string;
  position?: number;
}): Promise<UploadProductImageResponse> {
  const response = await fetch(`${apiBaseUrl}/products/${productId}/images/${imageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      altText,
      isPrimary,
      isGallery,
      usage,
      tryOnSize,
      position,
    }),
  });

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return (await response.json()) as UploadProductImageResponse;
}

export async function fetchAdminCollections(): Promise<AdminCollection[]> {
  const response = await fetch(`${apiBaseUrl}/collections`);

  if (!response.ok) {
    throw new Error(`API bộ sưu tập trả về mã ${response.status}`);
  }

  return (await response.json()) as AdminCollection[];
}

export async function saveAdminCollection(
  collection: AdminCollectionPayload,
): Promise<AdminCollection> {
  const { id, ...body } = collection;
  const response = await fetch(
    id ? `${apiBaseUrl}/collections/${id}` : `${apiBaseUrl}/collections`,
    {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  return (await response.json()) as AdminCollection;
}

export async function removeAdminCollection(id: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/collections/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }
}

export async function uploadCollectionCoverImage(
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${apiBaseUrl}/collections/cover-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await readApiError(response);
    throw new Error(message);
  }

  const result = (await response.json()) as UploadCollectionCoverImageResponse;
  return result.coverImage;
}

function toAdminProduct(product: ApiProduct): AdminProduct {
  const name = product.nameVi || product.name;
  const category = product.categoryVi || product.category;
  const description = product.descriptionVi ?? product.description ?? '';

  return {
    id: product.id,
    name,
    slug: slugify(name),
    category,
    collection: 'Danh mục cơ sở dữ liệu',
    price: Number(product.price.replace(/[^0-9.]+/g, '')) || 0,
    material: 'Cập nhật chất liệu trong chi tiết sản phẩm',
    fitType: 'regular',
    tags: [product.garment ?? category.toLowerCase()],
    status: product.isActive ? 'active' : 'hidden',
    visibility: product.isActive ? 'Visible' : 'Hidden',
    updatedAt: product.updatedAt?.slice(0, 10) ?? '',
    image: product.image,
    description,
    seoTitle: `${name} | Hichic`,
    seoDescription: description,
    tryOnStatus: product.image ? 'Ready' : 'Needs image',
  };
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    const message = body.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (message) {
      return message;
    }
  } catch {
    // Fall back to status text below.
  }

  return response.statusText || `Yêu cầu thất bại với mã ${response.status}`;
}
