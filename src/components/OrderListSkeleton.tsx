import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function OrderListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card/70 border-border h-[250px] flex flex-col justify-between">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-8 w-[80px]" />
                        <Skeleton className="h-6 w-[60px] rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[60%]" />
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </Card>
            ))}
        </div>
    )
}
