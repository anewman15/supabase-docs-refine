import { useState, useEffect } from "react";
import {
  BaseKey,
  useForm,
  useGetIdentity,
  useLogout,
} from "@refinedev/core";
import Avatar from "./avatar";

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
        <Avatar
          id={userIdentity?.id}
          url={formValues?.avatar_url}
          size={150}
          formValues={formValues}
        />
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
