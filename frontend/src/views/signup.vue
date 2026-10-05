<template>
  <div class="form-container">
    <div class="tab-pane fade show active" id="register" role="tabpanel" aria-labelledby="register-tab">
      <h3 class="text-center mb-3">Register</h3>
      <form @submit.prevent="handleRegister">
        <!-- Role -->
        <div class="mb-3">
          <label for="role" class="form-label">Role</label>
          <select id="role" name="role" v-model="form.role" class="form-select" required>
            <option value="" disabled selected>Select Role</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>

        <!-- Title -->
        <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <select id="title" name="title" v-model="form.title" class="form-select" placeholder="Select Title" required>
            <option value="" disabled selected>Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
          </select>
        </div>

        <!-- First + Last Name in one row -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="firstName" class="form-label">First Name</label>
            <input type="text" id="firstName" name="firstName" v-model="form.firstName"  class="form-control" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="lastName" class="form-label">Last Name</label>
            <input type="text" id="lastName" name="lastName" v-model="form.lastName" class="form-control" required>
          </div>
        </div>

        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="text" id="email" name="email" v-model="form.email" class="form-control" required>
        </div>

        <!-- Password + Confirm -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" id="password" name="password" v-model="form.password" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" v-model="form.confirmPassword" class="form-control" required>
        </div>

        <button type="submit" class="btn btn-primary w-100">Register</button>
      </form>
      <!-- Register link -->
            <p class="text-center mt-3">
                Already have an account? Log in
                <a href="#" @click.prevent="goToSignIn" class="d-inline">here</a>
            </p>
    </div>
  </div>
</template>

<style>
    body {
    display: flex;
    justify-content: center;
    align-items: center;   /* vertical centering */
    min-height: 100vh;     /* always fill screen */
    background-color: #E3EBFF !important;
    margin: 0;
    }

    .form-container {
    width: 90%;
    max-width: 500px;   
    height: 100%;
    padding: 2rem;
    border: 0.3px solid grey;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    }

    .form-label {
    display: block;
    font-weight: bold;
    }
</style>

<script>
import { registerUser } from "../api"; // getting 

export default {
  name: "signup",
  data() {
    return {
      form: {
        role: "",
        title: "",
        firstName: "",
        lastName: "",
        email: "",       // 🔹 match your backend field name
        password: "",
        confirmPassword: ""
      }
    };
  },
  methods: {
    async handleRegister() {
      try {
        const res = await registerUser(this.form);
        console.log("Registered:", res.data);

        // After successful registration → redirect to login
        this.$router.push("/login");
        alert(res.data.message || "Registration successful!");
      } catch (err) {
        console.error("Registration failed:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Registration failed");
      }
    },

    goToSignIn() {
      // Navigate to the register page when link is clicked
      this.$router.push("/login");
    }
  }
};
</script>