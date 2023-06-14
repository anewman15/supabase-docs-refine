import Layout from '~/layouts/DefaultGuideLayout'

export const meta = {
  title: 'Build a User Management App with **refine**',
  description: 'Learn how to use Supabase in your refine App.',
}

<QuickstartIntro />

![Supabase User Management example](/docs/img/user-management-demo.png)


## About refine

[**refine**](https://refine.dev) is a React based framework that is used to rapidly build data heavy applications like admin panels, dashboards and storefronts. It separates app concerns into individual layers, each backed by a React context and respective provider object. For example, the auth layer represents a context served by a specific set of `authProvider` methods that carry out authentication and athorization actions such as logging in, logging out, getting roles data, etc. Similarly, the data layer offers another level of abstraction that is equipped with `dataProvider` methods to handle CRUD operations at appropriate backend API endpoints.

The provider methods are accessed from a UI component via corresponding hooks. **refine**'s core package provides low level and high level hooks for each provider method. For example, `authProvider`'s `login` method is accessible via the `useLogin()` auth hook and the `logOut` method can be reached via the `useLogOut()` hook; and `dataProvider`'s `update` method is invoked via the `useUpdate()` data hook and also via the `useForm()` hook. We'll elaborate on these in the coming sections.

**refine** provides excellent support for **Supabase** backend with its optional `@refinedev/supabase` package. It generates `authProvider` and `dataProvider` methods at project initialization so we don't need to expend much effort to define them ourselves. We just need to choose **Supabase** as our backend service while creating the app with **refine CLI**.


<Admonition type="note">
It is possible to customize the `authProvider` for **Supabase** while the `dataProvider` is stable and cannot be modified. The `authProvider` can be changed from `src/authProvider.ts` file. In contrast, **Supabase** `dataProvider` is part of `node_modules` and therefore not subject to modification.
</Admonition>


<Admonition type="note">
  If you get stuck while working through this guide, refer to the [full example on
  GitHub]().
</Admonition>

<ProjectSetup />


## Building the App

Let's start building the **refine** app from scratch.

### Initialize a refine app

We can use [refine CLI](https://refine.dev/docs/packages/documentation/cli/) to initialize
an app called `supabase-refine`. Run the following in the terminal:

```bash
npm create refine-app@latest -- --preset refine-supabase supabase-refine
```

In the above `npm create` command, we are using the `refine-supabase` preset which chooses the **Supabase** supplementary package for our app. We are not using any UI framework so we'll have a headless UI with plain React and CSS styling.

The `refine-supabase` preset installs the `@refinedev/supabase` package which out-of-the-box includes the **Supabase** dependency: [supabase-js](https://github.com/supabase/supabase-js).

With the app initialized, at this point before we begin discussing **refine** concepts, let's try running the app:

```npm
cd supabase-refine
npm run dev
```

We should have a running instance of the app with a Welcome page at `http://localhost:5173`.

Let's move ahead to understanding the generated code now.


### refine `supabaseClient`

The **refine CLI** generated a **Supabase** client for us in the `src/utility/supabaseClient.ts` file.

We'll update it with environment variables managed by Vite:

```ts title="src/utility/supabaseClient.ts"
import { createClient } from "@refinedev/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
```

The `SUPABASE_URL` and `SUPABASE_KEY` constants are assigned some default values at initialization. We want to replace them with our own **Supabase** server's values. For this, we want to save the environment variables in a `.env.local` file. All you need are the API URL and the `anon` key that you copied [earlier](#get-the-api-keys).

```bash title=.env.local
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

The `supabaseClient` will be used in fetch calls to **Supabase** endpoints from our app. As we'll see below, the client is instrumental in implementing authentication using **refine**'s auth provider methods and CRUD actions with appropriate data provider methods.

One optional step is to update the CSS file `src/App.css` to make the app look nice.
You can find the full contents of this file [here]().

In order for us to add login and user profile pages in this app, we have to tweak the `<Refine />` component inside `App.tsx`.


### The `<Refine />` Component

The `App.tsx` file initially looks like this:

```tsx title="src/App.tsx"
import { GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import authProvider from "./authProvider";
import { supabaseClient } from "./utility";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
            <Route index element={<WelcomePage />} />
          </Routes>
          <RefineKbar />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
```

We'd like to focus on the `<Refine />` component, which comes with several props passed to it. Notice the `dataProvider` prop. It uses a `dataProvider()` function with `supabaseClient` passed as argument to generate the data provider object. The `authProvider` object also uses `supabaseClient` in implementing its methods. You can look it up in `src/authProvider.ts` file.


## Customize `authProvider`

If you examine the `authProvider` object you can notice that it has a `login` method that implements a OAuth and Email / Password strategy for authentication. We'll, however, ditch them and use Magic Links to allow users sign in with their email without using passwords.

We want to use `supabaseClient` auth's `signInWithOtp` method inside `authProvider.login` method:

```ts
login: async ({ email }) => {
    try {
      const { error } = await supabaseClient.auth.signInWithOtp({ email });

      if (error) {
        throw new Error(error.message);
      } else {
        alert("Check your email for the login link!");
        return {
          success: true,
        };
      }
    } catch (e) {
      return {
        success: false,
        e,
      };
    }
  },
```

We also want to remove `register`, `updatePassword`, `forgotPassword` and `getPermissions` properties, which are optional type members and also not necessary for our app. The final `authProvider` object looks like this:

```ts title="src/authProvider.ts"
import { AuthBindings } from "@refinedev/core";

import { supabaseClient } from "./utility";

const authProvider: AuthBindings = {
  login: async ({ email }) => {
    try {
      const { error } = await supabaseClient.auth.signInWithOtp({ email });

      if (error) {
        throw new Error(error.message);
      } else {
        alert("Check your email for the login link!");
        return {
          success: true,
        };
      }
    } catch (e) {
      return {
        success: false,
        e,
      };
    }
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const { session } = data;

      if (!session) {
        return {
          authenticated: false,
          error: {
            message: "Check failed",
            name: "Session not found",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      return {
        authenticated: false,
        error: error || {
          message: "Check failed",
          name: "Not authenticated",
        },
        logout: true,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: true,
    };
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data?.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
};

export default authProvider;
```


### Set up a Login component

We have chosen to use the headless **refine** core package that comes with no supported UI framework. So, let's set up a plain React component to manage logins and sign ups.

Create and edit `src/components/auth.tsx`:

```ts title="src/components/auth.tsx"
import { useState } from "react";
import { useLogin } from "@refinedev/core";

export default function Auth() {
    const [email, setEmail] = useState("");
    const { isLoading, mutate: login } = useLogin();
    
    const handleLogin = async (event: { preventDefault: () => void }) => {
      event.preventDefault();
      login({ email });
    };

  return (
    <div className="row flex flex-center container">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + refine</h1>
        <p className="description">Sign in via magic link with your email below</p>
        <form className="form-widget" onSubmit={handleLogin}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button className={"button block"} disabled={isLoading}>
              {isLoading ? <span>Loading</span> : <span>Send magic link</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

Notice we are using the **refine** auth `useLogin()` hook to grab the `mutate: login` method to use inside `handleLogin()` function and `isLoading` state for our form submission. The `useLogin()` hook conveniently offers us access to `authProvider.login` method for authenticating the user with OTP.

[Refer to the `useLogin()` hook docs for more details.](https://refine.dev/docs/api-reference/core/hooks/authentication/useLogin/)


### Account page

After a user is signed in we can allow them to edit their profile details and manage their account.

Let's create a new component for that in `src/components/account.tsx`.

```tsx title="src/components/account.tsx"
import { useState, useEffect } from "react";
import {
  BaseKey,
  useForm,
  useGetIdentity,
  useLogout,
} from "@refinedev/core";

export interface IUserIdentity {
  id?: BaseKey;
  username: string;
  name: string;
};

export interface IProfile {
  id?: string;
  username?: string;
  website?: string;
  avatar_url?: string;
};

export default function Account() {
  const { data: userIdentity } = useGetIdentity<IUserIdentity>();

  const { mutate: logOut } = useLogout();

  const { formLoading, onFinish, queryResult } = useForm<IProfile>({
    resource: "profiles",
    action: "edit",
    id: userIdentity?.id,
    redirect: false,
  });

  const defaultFormValues = queryResult?.data?.data;

  const [formValues, setFormValues] = useState<IProfile>({
    id: defaultFormValues?.id || "",
    username: defaultFormValues?.username || "",
    website: defaultFormValues?.website || "",
    avatar_url: defaultFormValues?.avatar_url || "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFinish(formValues);
  };

  useEffect(
    () => {
      setFormValues({
        id: defaultFormValues?.id || "",
        username: defaultFormValues?.username || "",
        website: defaultFormValues?.website || "",
        avatar_url: defaultFormValues?.avatar_url || "",
      })
    }, [defaultFormValues]
  );

  return (
    <div className="container" style={{ padding: "50px 0 100px 0" }}>
      <form onSubmit={handleSubmit} className="form-widget">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="text" value={userIdentity?.name} disabled />
        </div>
        <div>
          <label htmlFor="username">Name</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formValues?.username}
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="url"
            value={formValues?.website}
            onChange={handleOnChange}
          />
        </div>

        <div>
          <button className="button block primary" type="submit" disabled={formLoading}>
            {formLoading ? "Loading ..." : "Update"}
          </button>
        </div>

        <div>
          <button className="button block" type="button" onClick={() => logOut()}>
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
};
```

Notice above that, we are using three **refine** hooks, namely the `useGetIdentity()`, `useLogOut()` and `useForm()` hooks.

`useGetIdentity()` is a auth hook that gets the identity of the authenticated user. It grabs the current user by invoking the `authProvider.getIdentity` method under the hood.

[Refer to the `useGetIdentity()` hook docs for more details.](https://refine.dev/docs/api-reference/core/hooks/authentication/useGetIdentity/)

`useLogOut()` is also an auth hook. It calls the `authProvider.logout` method to end the session.

[Refer to the `useLogOut()` hook docs for more details.](https://refine.dev/docs/api-reference/core/hooks/authentication/useLogout/)

`useForm()`, in contrast, is a data hook that exposes a series of useful objects that serve the edit form. For example, we are grabbing `queryResult` to present fetched API data inside form fields. We are also using the `onFinish` function to define the `handleSubmit` event handler and `formLoading` property to present state changes of the submitted form. The `useForm()` hook invokes the `dataProvider.getOne` method to get the user profile data from our **Supabase** `/profiles` endpoint. It also invokes `dataProvider.update` method when `onFinish()` is called.

[Refer to the `useForm()` hook docs for more details.](https://refine.dev/docs/api-reference/core/hooks/useForm/)


### Launch!

Now that we have all the components in place, let's define the routes for the pages in which they should be rendered.

Add the routes for `/login` with the `<Auth />` component and the routes for `index` path with the `<Account />` component:

```tsx title="src/App.tsx"
import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import authProvider from "./authProvider";
import { supabaseClient } from "./utility";
import Account from "./components/account";
import Auth from "./components/auth";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
          // highlight-start
            <Route
              element={
                <Authenticated
                    fallback={<CatchAllNavigate to="/login" />}
                >
                    <Outlet />
                </Authenticated>
              }
            >
              <Route index element={<Account />} />
            </Route>
            <Route
              element={
                <Authenticated
                  fallback={<Outlet />}
                />
              }
            >
              <Route path="/login" element={<Auth />} />
            </Route>
            // highlight-end
          </Routes>
          <RefineKbar />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
```

Let's test the app by running the server again:

```bash
npm run dev
```

And then open the browser to [localhost:5173](http://localhost:5173) and you should see the completed app.

![Supabase refine](/docs/img/supabase-react-demo.png)


## Bonus: Profile photos

Every Supabase project is configured with [Storage](/docs/guides/storage) for managing large files like photos and videos.

### Create an upload widget

Let's create an avatar for the user so that they can upload a profile photo. We can start by creating a new component:

Create and edit `src/components/avatar.tsx`:

```tsx title="src/components/avatar.tsx"
import { useEffect, useState } from "react";
import { supabaseClient } from "../utility/supabaseClient";
import { BaseKey, useUpdate } from "@refinedev/core";
import { IProfile } from "./account";

export default function Avatar({ id, url, size, formValues }: { id?: BaseKey; url?: string; size: number; formValues: IProfile}) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { mutate } = useUpdate();
  
  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabaseClient.storage.from("avatars").download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error: any) {
      console.log("Error downloading image: ", error?.message);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabaseClient.storage.from("avatars").upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      mutate({
        resource: "profiles",
        values: {
          ...formValues,
          avatar_url: filePath,
        },
        id,
      })
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? "Uploading ..." : "Upload"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          name="avatar"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
};
```

Notice we are using another  **refine** data hook above, the `useUpdate()` hook, which basically invokes the `dataProvider.update` method behind the scenes to upload and update the avatar image.

[Refer to the `useUpdate()` hook docs for more details.](https://refine.dev/docs/api-reference/core/hooks/data/useUpdate/)


### Add the new widget

And then we can add the widget to the Account page at `src/components/account.tsx`:

```tsx title="src/components/account.tsx"
// Import the new component
import Avatar from "./avatar";

// ...

return (
  <div className="container" style={{ padding: '50px 0 100px 0' }}>
    <form onSubmit={handleSubmit} className="form-widget">
      <Avatar
        id={userIdentity?.id}
        url={formValues?.avatar_url}
        size={150}
        formValues={formValues}
      />
      {/* ... */}
    </form>
  </div>
)
```


### Storage management

<StorageManagement />

At this stage you have a fully functional application!

export const Page = ({ children }) => <Layout meta={meta} children={children} />

export default Page
