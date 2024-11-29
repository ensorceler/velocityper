import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { MessageSquare, Bell as NotificationIcon } from "lucide-react";

export default function Notifications() {
  return (
    <Sheet>
      <SheetTrigger>
        <NotificationIcon className="nav-icon" />
      </SheetTrigger>
      <SheetContent className="bg-neutral-800/80 border-l-2 border-l-neutral-600 ">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 ">
            <MessageSquare />
            <p className="text-lg">Notifications</p>
          </SheetTitle>
        </SheetHeader>
        <SheetDescription className="mt-10">
          <p>No New Notifications</p>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
}
