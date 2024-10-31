import {
  UserRound as UserIcon,
  Bell as NotificationIcon,
  Zap as RaceWithFriendsIcon,
  Crown as LeaderboardIcon,
  Keyboard as KeyboardIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Nav() {
  return (
    <div className="max-w-5xl ml-auto mr-auto mt-10 flex justify-between items-start">
      {/** logo section */}
      <div className="flex flex-row items-start gap-3">
        {/** logo */}
        <div className="flex flex-col">
          <h1 className="font-geistMono text-4xl">
            <span className="text-emerald-500">VELOCI</span>TYPER
          </h1>
          <p className="font-geistSans text-sm">
            With Great Velocity Comes Great Victory!
          </p>
        </div>
        {/** logo */}
        <div className="flex flex-row items-center gap-6 py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link href="/" passHref>
                  <KeyboardIcon className="nav-icon" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Practice Typing</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Link href="/race-with-friends" passHref>
                  <RaceWithFriendsIcon className="nav-icon" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Race Against Friends</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Link href="/leaderboard" passHref>
                  <LeaderboardIcon className="nav-icon" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Leaderboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Link href="/settings" passHref>
                  <SettingsIcon className="nav-icon" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/** user icon section */}
      <div className="py-2 flex flex-row gap-6 items-center ">
        <NotificationIcon className="nav-icon" />
        <UserIcon className="nav-icon" />
      </div>
    </div>
  );
}
