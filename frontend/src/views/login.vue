<template>
    <div class="form-container">
        <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
            <h3 class="text-center mb-3">Login</h3>
            <form @submit.prevent="onSubmit">
                <!-- username and password -->
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="text" v-model="form.email" class="form-control" id="email" name="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" v-model="form.password" class="form-control" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <!-- Register link -->
            <p class="text-center mt-3">
                Don’t have an account?
                <a href="#" @click.prevent="goToRegister" class="d-inline">Register here</a>
            </p>
        </div>
    </div>
</template>

<style>
    @media (max-width: 600px) {
    .form-container {
        max-width: 90%;
        padding: 1.5rem;
    }
    }

    body {
        display: flex;
        justify-content: center;   
        align-items: flex-start;
        background-color: #E3EBFF !important;
    }

    .form-container {
        width: 90%;
        height: 100%;
        margin: 200px auto;
        align-items: center;
        padding: 40px;
        padding-top: 70px;
        border: 0.3px solid grey;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #fff;
    }

    .nav-tabs .nav-link.active {
        background-color: #007bff;
        color: white;
    }

    .form-label {
        display: block;
        font-weight: bold;
        text-align: left;
    }

</style>

<script>
import { loginUser } from "../api"; // adjust path to your api.js file

export default {
  name: "login",
  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      user: {},
    };
  },
  mounted() {
    const res = JSON.parse(localStorage.getItem("user"));
    if (res) this.user = res;
  },
  methods: {
    async onSubmit() {
  try {
    const res = await loginUser(this.form);

    const user = res.data.user; // Make sure API returns { user: { role: "student" } }
    console.log("User", user);
    // Store user info locally if needed
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "student") {
      // Students go straight to CoursesPage
      this.$router.push("/courses");
    } else if (user.role === "teacher" || user.role === "admin") {
      // Teachers go to Lessons page
      this.$router.push("/lessons");
    } else {
      // fallback
      this.$router.push("/login");
    }
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Invalid email or password");
  }
},

    goToRegister() {
      // Navigate to the register page when link is clicked
      this.$router.push("/signup");
    }


  }
};
</script>
