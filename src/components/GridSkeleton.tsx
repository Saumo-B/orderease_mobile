import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-card/70 border-border h-[180px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <Skeleton className="h-6 w-[60%]" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-4 mt-auto">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[40%]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
