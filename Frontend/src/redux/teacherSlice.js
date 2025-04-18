import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.teachers; // Expect { teachers: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teachers');
    }
  }
);

export const addTeacher = createAsyncThunk(
  'teachers/addTeacher',
  async (teacherData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/teachers`, teacherData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.teacher; // Expect { teacher: {...} }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add teacher');
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/deleteTeacher',
  async (teacherId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return teacherId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete teacher');
    }
  }
);

const teacherSlice = createSlice({
  name: 'teachers',
  initialState: {
    teachers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers.push(action.payload);
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = state.teachers.filter(
          (teacher) => teacher._id !== action.payload
        );
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teacherSlice.reducer;