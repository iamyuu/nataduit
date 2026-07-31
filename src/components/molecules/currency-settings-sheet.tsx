import { CURRENCIES } from "@/domain/currency"
import { useCurrency } from "@/providers/currency-provider"
import { cn } from "@/utils/misc"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/atoms/drawer"

interface CurrencySettingsSheetProps {
  open: boolean
  onClose: () => void
}

export function CurrencySettingsSheet({
  open,
  onClose,
}: CurrencySettingsSheetProps) {
  const { currency, setCurrency } = useCurrency()

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Currency</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col px-4 pb-6">
          {CURRENCIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setCurrency(item.code)
                onClose()
              }}
              className={cn(
                "flex items-center justify-between border-b border-border py-3 text-left last:border-0",
                item.code === currency && "text-primary"
              )}
            >
              <span className="text-sm font-medium">{item.code}</span>
              <span className="text-sm text-muted-foreground">
                {item.symbol}
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
