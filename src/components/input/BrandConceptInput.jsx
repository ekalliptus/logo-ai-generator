import { Card } from '../ui/Card';

/**
 * Brand concept textarea input component
 */
export function BrandConceptInput({ value, onChange }) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        1. Brand Concept
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="4"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none transition-colors"
        placeholder="E.g., A minimalist logo for a coffee shop named 'The Daily Grind' that uses a stylized coffee bean."
      />
      <p className="text-sm text-gray-500 mt-2">
        Describe the core idea for your logo.
      </p>
    </Card>
  );
}
