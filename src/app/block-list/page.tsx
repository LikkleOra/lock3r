import { BlockManager } from '@/components/blocks/BlockManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function BlockListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      <BlockManager />
    </div>
  );
}