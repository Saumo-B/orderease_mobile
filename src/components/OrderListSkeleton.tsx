import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function OrderListSkeleton() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-card/40 border-white/5 h-[320px] flex flex-col justify-between overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between pb-2 bg-white/5">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-24 rounded-md" /> {/* Token */}
                            <Skeleton className="h-4 w-32 rounded-sm" /> {/* Name/Phone */}
                        </div>
                        <Skeleton className="h-6 w-16 rounded-md" /> {/* Amount */}
                    </CardHeader>

                    <CardContent className="flex-grow space-y-2 py-4">
                        <Skeleton className="h-4 w-full rounded-sm" />
                        <Skeleton className="h-4 w-full rounded-sm" />
                        <Skeleton className="h-4 w-[70%] rounded-sm" />
                    </CardContent>

                    <div className="p-4 pt-0 gap-3 flex mt-auto">
                        <Skeleton className="h-9 flex-1 rounded-md opacity-50" />
                        <Skeleton className="h-9 flex-1 rounded-md" />
                    </div>
                </Card>
            ))}
        </>
    )
}
