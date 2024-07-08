import Link from "next/link";
import Image from "next/image";

import { Year } from "@/components/Year";
import { getUser } from "@/lib/actions/patient.actions";
import { RegisterForm } from "@/components/forms/RegisterForm";

import * as Sentry from "@sentry/nextjs";

const Register = async ({ params: { userId } }: SearchParamProps) => {
  const user = await getUser(userId);

  Sentry.metrics.set("user_view_register", user.name);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[869px] flex-1 flex-col py-10">
          <Link href='/'>
            <Image
              src="/assets/icons/logo-full.svg"
              alt="patient"
              width={1000}
              height={1000}
              className="mb-12 h-10 w-fit"
            />
          </Link>
          <RegisterForm user={user} />

          <p className="copyright py-12">© <Year /> Careplus</p>
        </div>
      </section>

      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};

export default Register;