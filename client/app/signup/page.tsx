"use client";

import styles from "./signup.module.css";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Insert into profiles
    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: form.email,
          full_name: form.firstName + " " + form.lastName,
        },
      ]);
    }

    alert("Account created successfully!");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>SIGN UP</h1>
        <p className={styles.subtitle}>
          Welcome! Please enter your details
        </p>

        <p className={styles.step}>Step 1 of 2</p>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>First name</label>
            <input
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Last name</label>
            <input
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            placeholder="+1 123456789"
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm password</label>
            <input
              type="password"
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className={styles.checkbox}>
          <input type="checkbox" />
          <span>
            I agree to Terms of Service and Privacy Policy
          </span>
        </div>

        <button className={styles.btn} onClick={handleSignup}>
          Next →
        </button>
      </div>
    </div>
  );
}