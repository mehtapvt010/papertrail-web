import { Card, CardContent } from '@/components/ui/card';

export default function DocumentSkeleton() {
  return (
    <Card className="overflow-hidden border bg-card shadow-sm">
      <CardContent className="p-0">
        {/* Thumbnail skeleton */}
        <div className="h-48 bg-muted animate-pulse" />
        
        {/* Content skeleton */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
          </div>
          
          {/* Type badge */}
          <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
          
          {/* Metadata */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <div className="h-8 bg-muted rounded animate-pulse flex-1" />
            <div className="h-8 bg-muted rounded animate-pulse flex-1" />
            <div className="h-8 bg-muted rounded animate-pulse flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
  