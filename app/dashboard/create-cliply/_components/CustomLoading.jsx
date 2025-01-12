import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog"
import CustomLoader from '@/components/ui/custom-loader'

function CustomLoading({loading}) {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent className="bg-transparent border-none shadow-none">
        <CustomLoader />
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CustomLoading