import type { 
  NewBoatFormData, 
  BoatIPFSData, 
  BoatSpecification 
} from '@/lib/boat.types';

export function formDataToIPFSData(formData: NewBoatFormData, imageUrls: string[] = []): BoatIPFSData {
  const specification: BoatSpecification = {
    price: formData.price,
    title: formData.title,
    name: formData.name,
    city: formData.port || '',
    postal_code: formData.postalCode || '',
    year: formData.year,
    description: `Bateau ${formData.name} de ${formData.year}`,
    summary: `${formData.boat_type} - ${formData.port}`,
    status: 'validated',
    // Convert string inputs to numbers
    overall_length: Number(formData.overall_length || 0),
    width: Number(formData.width || 0),
    draft: Number(formData.draft || 0),
    engine: formData.engine || '',
    fresh_water_capacity: Number(formData.fresh_water_capacity || 0),
    fuel_capacity: Number(formData.fuel_capacity || 0),
    cabins: Number(formData.cabins || 0),
    beds: Number(formData.beds || 0),
    boat_type: formData.boat_type || 'sailboat',
    navigation_category: formData.navigation_category || 'C - inshore navigation',
  };

  return {
    specification,
    certificates: [],
    events: [],
    images: imageUrls.map((url, index) => ({ uri: url, title: `Image ${index + 1}` })),
  };
}

export function mapMetadataToSpec(meta: any, fallback: Partial<any>): BoatSpecification {
  // Beaucoup de JSON NFT ont { name, description, image, attributes: [{trait_type, value}] }
  const attributes: Record<string, any> = {};
  if (Array.isArray(meta?.attributes)) {
    for (const att of meta.attributes) {
      if (att?.trait_type && att?.value != null) {
        attributes[String(att.trait_type).toLowerCase()] = att.value;
      }
    }
  }

  // On essaye d'enrichir avec ce qu'on trouve, sinon fallback.
  return {
    price: Number(meta?.price ?? fallback.price ?? 0),
    title: meta?.name ?? fallback.title ?? `Bateau #${fallback.id ?? ''}`,
    name: meta?.name ?? fallback.name ?? `Bateau #${fallback.id ?? ''}`,
    city: meta?.city ?? fallback.city ?? '',
    postal_code: meta?.postal_code ?? fallback.postal_code ?? '',
    year: Number(meta?.year ?? attributes['year'] ?? fallback.year ?? new Date().getFullYear()),
    description: meta?.description ?? fallback.description ?? '',
    summary: meta?.description ?? fallback.summary ?? '',
    status: 'validated' as 'validated' | 'pending' | 'rejected',
    overall_length: Number(meta?.overall_length ?? attributes['overall_length'] ?? fallback.overall_length ?? 0),
    width: Number(meta?.width ?? attributes['width'] ?? fallback.width ?? 0),
    draft: Number(meta?.draft ?? attributes['draft'] ?? fallback.draft ?? 0),
    engine: meta?.engine ?? attributes['engine'] ?? fallback.engine ?? '',
    fresh_water_capacity: Number(meta?.fresh_water_capacity ?? attributes['fresh_water_capacity'] ?? fallback.fresh_water_capacity ?? 0),
    fuel_capacity: Number(meta?.fuel_capacity ?? attributes['fuel_capacity'] ?? fallback.fuel_capacity ?? 0),
    cabins: Number(meta?.cabins ?? attributes['cabins'] ?? fallback.cabins ?? 0),
    beds: Number(meta?.beds ?? attributes['beds'] ?? fallback.beds ?? 0),
    boat_type: meta?.boat_type ?? attributes['type'] ?? fallback.boat_type ?? 'sailboat',
    navigation_category: meta?.navigation_category ?? attributes['navigation_category'] ?? fallback.navigation_category ?? 'C - inshore navigation',
  };
}