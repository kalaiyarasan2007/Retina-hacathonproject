import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
  buttonSize?: "default" | "sm" | "icon";
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  iconOnly?: boolean;
  className?: string;
}

export function DeleteButton({
  onDelete,
  title = "Delete Record?",
  description = "This action cannot be undone.",
  buttonSize = "icon",
  buttonVariant = "ghost",
  iconOnly = true,
  className,
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success("Record deleted successfully");
      setIsOpen(false);
    } catch (err) {
      toast.error("Delete failed. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Delete</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
