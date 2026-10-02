import React from 'react';
import CompanyBrand from './CompanyBrand';

export default function Branding({ layout = 'row' }) {
  const variant = layout === 'column' ? 'vertical' : 'footer';
  return <CompanyBrand variant={variant} />;
}
