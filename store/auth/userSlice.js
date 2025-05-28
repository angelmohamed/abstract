import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserData } from "@/app/ApiAction/api";
export const initialState = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  blockNo: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  emailStatus: "",
  phoneStatus: "",
  phoneCode: "",
  phoneNo: "",
  type: "",
  idProof: "",
  addressProof: "",
  twoFAStatus: "",
  createAt: "",
  loginHistory: {},
  bankDetail: {},
  antiphishingcode: "",
  profileImage: "",
  referralCode: "",
  perncetage: "0",
  _id: "",
  changepassword: "false",
  percentage: 0,
  otp:[]
};

export const getUserDetails = createAsyncThunk("auth/user", async () => {
  const response = await getUserData();
  return response.result;
});

export const userSlice = createSlice({
  name: "auth/user",
  initialState: initialState,
  reducers: {
    setUser: (_, action) => action.payload,
    userLoggedOut: () => initialState,
    setUserProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    setProfilePercentage: (state, action) => {
      let perncetage = 0;
      // if (state.emailStatus == "verified"){
      //   console.log('emailStatus')
      //   perncetage += 10
      // } 
      // if (state.phoneStatus == "verified"){
      //   console.log('phoneStatus')
      //   perncetage += 10
      // } 
      // if (!isEmpty(state.profileImage)){
      //   console.log('profileImage11')
      //   perncetage += 10
      // } 
      // if (!isEmpty(state.antiphishingcode)) {
      //   perncetage += 10
      // }
      // if (state.twoFAStatus=='enabled') {
      //   perncetage += 20
      // }
      // if (state.idProof=='approved') {
      //   perncetage += 10
      // }
      // if (state.addressProof=='approved') {
      //   perncetage += 10
      // }
      // if (state.addressProof=='true') {
      //   perncetage += 10
      // }
      // if (!isEmpty(state.bankDetail)) {
      //   perncetage += 10
      // }
      // if (state.changepassword == true){
      //   console.log('changepassword833')
      //   perncetage += 10
      // } 
      state.perncetage = perncetage

    },

  },

  extraReducers: {
    [getUserDetails.fulfilled]: (state, action) => {
      (state.userId = action?.payload?.userId),
        (state.firstName = action?.payload?.firstName),
        (state.lastName = action?.payload?.lastName),
        (state.email = action?.payload?.email),
        (state.blockNo = action?.payload?.blockNo),
        (state.address = action?.payload?.address),
        (state.city = action?.payload?.city),
        (state.state = action?.payload?.state),
        (state.country = action?.payload?.country),
        (state.postalCode = action?.payload?.postalCode),
        (state.emailStatus = action?.payload?.emailStatus),
        (state.phoneStatus = action?.payload?.phoneStatus),
        (state.phoneCode = action?.payload?.phoneCode),
        (state.phoneNo = action?.payload?.phoneNo),
        (state.type = action?.payload?.type),
        (state.idProof = action?.payload?.idProof),
        (state.addressProof = action?.payload?.addressProof),
        (state.twoFAStatus = action?.payload?.twoFAStatus),
        (state.createAt = action?.payload?.createAt),
        (state.loginHistory = action?.payload?.loginHistory),
        (state.bankDetail = action?.payload?.bankDetail),
        (state.referralCode = action?.payload?.referralCode),
        (state.antiphishingcode = action?.payload?.antiphishingcode);
      (state.antiphishingStatus = action?.payload?.antiphishingStatus);
      (state.changepassword = action?.payload?.changepassword);
      (state._id = action?.payload?._id);
      (state.percentage = action?.payload?.percentage);
      (state.assetPasswordStatus = action?.payload?.assetPasswordStatus);
      (state.otp = action?.payload?.otp);
    },
  },
});

export const { setUser, setUserProfileImage, setProfilePercentage } = userSlice.actions;

export default userSlice.reducer;
