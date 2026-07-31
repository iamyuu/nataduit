import { CURRENCIES, type CurrencyCode } from "@/domain/currency"
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
            <CurrencyOption
              key={item.code}
              code={item.code}
              symbol={item.symbol}
              isActive={item.code === currency}
              onSelect={() => {
                setCurrency(item.code)
                onClose()
              }}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface CurrencyOptionProps {
  code: CurrencyCode
  symbol: string
  isActive: boolean
  onSelect: () => void
}

function CurrencyOption({
  code,
  symbol,
  isActive,
  onSelect,
}: CurrencyOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between border-b border-border py-3 text-left last:border-0",
        isActive && "text-primary"
      )}
    >
      <span className="text-sm font-medium">{code}</span>
      <span className="text-sm text-muted-foreground">{symbol}</span>
    </button>
  )
}
