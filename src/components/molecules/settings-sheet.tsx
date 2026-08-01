import { CURRENCIES } from "@/domain/currency"
import { DATE_ORDERS, type DateOrder } from "@/domain/date-order"
import { useCurrency } from "@/providers/currency-provider"
import { useDateOrder } from "@/providers/date-order-provider"
import { cn } from "@/utils/misc"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/atoms/drawer"

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
}

const DATE_ORDER_LABELS: Record<DateOrder, string> = {
  "day-month": "Day, then month (2 May)",
  "month-day": "Month, then day (May 2)",
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { currency, setCurrency } = useCurrency()
  const { dateOrder, setDateOrder } = useDateOrder()

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          <SettingsSection title="Currency">
            {CURRENCIES.map((item) => (
              <SettingsOption
                key={item.code}
                label={item.code}
                detail={item.symbol}
                isActive={item.code === currency}
                onSelect={() => setCurrency(item.code)}
              />
            ))}
          </SettingsSection>
          <SettingsSection title="Backdating date order">
            {DATE_ORDERS.map((order) => (
              <SettingsOption
                key={order}
                label={DATE_ORDER_LABELS[order]}
                isActive={order === dateOrder}
                onSelect={() => setDateOrder(order)}
              />
            ))}
          </SettingsSection>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="flex flex-col rounded-md border border-border">
        {children}
      </div>
    </div>
  )
}

interface SettingsOptionProps {
  label: string
  detail?: string
  isActive: boolean
  onSelect: () => void
}

function SettingsOption({
  label,
  detail,
  isActive,
  onSelect,
}: SettingsOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between border-b border-border px-3 py-3 text-left last:border-0",
        isActive && "text-primary"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {detail && (
        <span className="text-sm text-muted-foreground">{detail}</span>
      )}
    </button>
  )
}
