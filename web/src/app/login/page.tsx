import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="max-w-5xl ml-auto mr-auto">
      <div className="w-full flex flex-row justify-between items-start">
        <div>
          <Card className="dark:bg-transparent">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Login Account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline">
                  <GitHubLogoIcon className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <Button variant="outline">
                  <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                    <path
                      fill="currentColor"
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full flex items-center gap-2 active:scale-95">
                <LogIn className="h-4 w-4" />
                <p>Login</p>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="dark:bg-transparent">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="m27user" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Verify Password</Label>
                <Input id="password-verification" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full flex items-center gap-2 active:scale-95">
                <UserPlus className="h-4 w-4" />
                <p>Register</p>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
