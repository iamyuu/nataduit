"use client"

import * as React from "react"
import { TrashIcon } from "@phosphor-icons/react"

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/alert-dialog"
import { Button } from "@/components/atoms/button"

interface DeleteButtonProps {
  children: string
  onConfirm: () => void
}

export function DeleteButton({ children, onConfirm }: DeleteButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onPress={() => setIsConfirmOpen(true)}
        aria-label={`Delete ${children}`}
      >
        <TrashIcon />
      </Button>
      <AlertDialogContent
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{children}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onPress={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </>
  )
}
