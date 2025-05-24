// import { LogoIcon } from "@/assets/icons";
import { setCredential, setUser } from "@/redux/reducers";
import { AuthApi } from "@/api/auth.api";
import { setHeaderConfigAxios } from "@/api/axios";
import { Input, Form, Button, FormProps } from "antd";
// import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

type FieldType = {
  email?: string;
  password?: string;
};

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setIsLoading(true);
      const res = await AuthApi.login(values);
      toast.success(`Welcome back ${res.data.user?.name}`);
      dispatch(setUser(res.data.user));
      setHeaderConfigAxios(res.data.access_token);
      dispatch(setCredential(res.data.access_token));
      if (res.data.user?.role === 1) {
        router.push("/");
      } else if (res.data.user?.role === 2) {
        router.push("/admin");
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = useCallback(() => {
    router.push("/signup");
  }, [router]);

  return (
    <div className="bg-white relative z-0 flex h-screen w-full overflow-hidden items-center justify-center">
      <div className="flex flex-col items-center gap-[70px]">
        <div className="">
          {/* <Image src={LogoIcon} alt="logo" height={48} /> */}
        </div>
        <div className="flex-col flex gap-[30px]">
          <p className="text-4xl font-semibold text-black text-center mb-[10px]">
            Welcome back
          </p>
          <Form
            name="basic"
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                  type: "email",
                },
              ]}
            >
              <Input
                className="min-h-[50px] min-w-[350px] text-xl text-black rounded-[12px] border-gray-400"
                placeholder="Email address"
              />
            </Form.Item>

            <Form.Item<FieldType>
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                className="min-h-[50px] min-w-[350px] text-xl text-black rounded-[12px] border-gray-400"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="min-h-[50px] min-w-[350px] rounded-[12px]"
                loading={isLoading}
                disabled={isLoading}
              >
                <span className="text-base">Submit</span>
              </Button>
            </Form.Item>
          </Form>
          <p className="text-base text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <span
              className="text-green-500 cursor-pointer"
              onClick={handleSignUp}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
