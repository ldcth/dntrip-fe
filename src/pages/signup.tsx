// import { LogoIcon } from "@/assets/icons";
import { AuthApi } from "@/api/auth.api";
import { Input, Form, Button, FormProps } from "antd";
// import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";

type FieldType = {
  name?: string;
  email?: string;
  password?: string;
  re_password?: string;
};

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      if (values.password === values.re_password) {
        setIsLoading(true);
        await AuthApi.register(values);
        toast.success("Create success!");
        router.push("/login");
      } else {
        toast.error("Confirm password is not correct!");
      }
    } catch (error: unknown) {
      console.log(error);
      let errorMessage = "Create failed!";
      if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === "string") {
          errorMessage = message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = useCallback(() => {
    router.push("/login");
  }, []);

  return (
    <div className="bg-white relative z-0 flex h-screen w-full overflow-hidden items-center justify-center">
      <div className="flex flex-col items-center gap-[70px]">
        <div className="">
          {/* <Image src={LogoIcon} alt="logo" height={48} /> */}
        </div>
        <div className="flex-col flex gap-[30px]">
          <p className="text-4xl font-semibold text-black text-center mb-[10px]">
            Create an account{" "}
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
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your name!",
                },
              ]}
            >
              <Input
                className="min-h-[50px] min-w-[350px] text-xl text-black rounded-[12px] border-gray-400"
                placeholder="Name"
              />
            </Form.Item>

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

            <Form.Item<FieldType>
              name="re_password"
              rules={[
                { required: true, message: "Please confirm your password!" },
              ]}
            >
              <Input.Password
                className="min-h-[50px] min-w-[350px] text-xl text-black rounded-[12px] border-gray-400"
                placeholder="Confirm password"
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
              onClick={handleSignIn}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
