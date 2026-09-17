import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FoodPartnerLogin from '../pages/FoodPartnerLogin'
import FoodPartnerRegister from '../pages/FoodPartnerRegister'
import UserLogin from '../pages/UserLogin'
import UserRegister from '../pages/UserRegister'
import Home from '../pages/general/Home'
import CreateFoodPartner from '../pages/food-partner/CreateFoodPartner'
import PartnerHome from '../pages/food-partner/PartnerHome'
import PartnerProfile from '../pages/food-partner/PartnerProfile'
import UserProfile from '../pages/general/UserProfile'
import Chat from '../pages/general/Chat'
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
        <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
         <Route path='/' element={<Home />} />
         <Route path='/user/home' element={<UserProfile />} />
         <Route path='/user/saved' element={<UserProfile />} />
         <Route path='/food-partner/home' element={<PartnerHome />} />
         <Route path='/food-partner/profile/:partnerId' element={<PartnerProfile />} />
         <Route path='/create-food-partner' element={<CreateFoodPartner />} />
         <Route path='/chat/:partnerId' element={<Chat />} />

      </Routes>
    </Router>
  )
}

export default AppRoutes
