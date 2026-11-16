$baseUrl = "http://localhost:5000/api"

Write-Host "==================== TEST 1: REGISTRATION ===================="
$regBody = @{
    full_name = "Kenneth Mugisha"
    email = "kmugisha@ucu.ac.ug"
    password = "Password123!"
    programme = "Bachelor of Science in Information Technology"
    year_of_study = 1
} | ConvertTo-Json
$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
Write-Host "Register result:" $regRes.success "User:" $regRes.user.full_name "Token received:" ($regRes.token.Length -gt 0)

Write-Host "`n==================== TEST 2: LOGIN ===================="
$loginBody = @{
    email = "kmugisha@ucu.ac.ug"
    password = "Password123!"
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Login result:" $loginRes.success "Role:" $loginRes.user.role

Write-Host "`n==================== TEST 3: CREATE STUDY GROUP ===================="
$groupBody = @{
    name = "Mobile App Development Android Pod"
    course_code = "BIT 1103"
    faculty = "Faculty of Science and Technology"
    description = "Focusing on Kotlin, Jetpack Compose, and API integrations."
    meeting_location = "Tech Lab 1 & Google Meet"
} | ConvertTo-Json
$groupRes = Invoke-RestMethod -Uri "$baseUrl/groups" -Method Post -Body $groupBody -Headers $headers -ContentType "application/json"
$newGroupId = $groupRes.groupId
Write-Host "Created Group ID:" $newGroupId "Leader role auto-assigned:" $groupRes.success

Write-Host "`n==================== TEST 4: SEARCH & FILTER GROUPS ===================="
$searchRes = Invoke-RestMethod -Uri "$baseUrl/groups?search=BIT"
Write-Host "Search by 'BIT' returned count:" $searchRes.count
$lawFilterRes = Invoke-RestMethod -Uri "$baseUrl/groups?faculty=Faculty%20of%20Law"
Write-Host "Filter by 'Faculty of Law' returned count:" $lawFilterRes.count

Write-Host "`n==================== TEST 5: JOIN GROUP & DUPLICATE PREVENTION ===================="
$graceLogin = @{ email = "grace@ucu.ac.ug"; password = "Password123!" } | ConvertTo-Json
$graceRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $graceLogin -ContentType "application/json"
$graceHeaders = @{ Authorization = "Bearer $($graceRes.token)" }

$joinRes = Invoke-RestMethod -Uri "$baseUrl/members/$newGroupId/join" -Method Post -Headers $graceHeaders
Write-Host "Grace joined Kenneth's group:" $joinRes.success

try {
    $dupRes = Invoke-RestMethod -Uri "$baseUrl/members/$newGroupId/join" -Method Post -Headers $graceHeaders
    Write-Host "Duplicate join unexpectedly succeeded!"
} catch {
    Write-Host "Duplicate membership successfully prevented! Status code:" $_.Exception.Response.StatusCode
}

Write-Host "`n==================== TEST 6: SCHEDULE STUDY SESSION ===================="
$sessBody = @{
    group_id = $newGroupId
    title = "Jetpack Compose UI Workshop"
    session_date = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    session_time = "14:00:00"
    location = "Tech Lab 1"
    description = "Hands on exercises on State hoisting and LazyColumns"
} | ConvertTo-Json
$sessRes = Invoke-RestMethod -Uri "$baseUrl/sessions" -Method Post -Body $sessBody -Headers $headers -ContentType "application/json"
Write-Host "Session scheduled successfully:" $sessRes.success

Write-Host "`n==================== TEST 7: GROUP DISCUSSIONS & REPLIES ===================="
$postBody = @{
    group_id = $newGroupId
    title = "Android Studio Emulator Setup Instructions"
    content = "Please enable Intel HAXM or Windows Hypervisor before our session on Thursday."
    post_type = "announcement"
} | ConvertTo-Json
$postRes = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $postBody -Headers $headers -ContentType "application/json"
$newPostId = $postRes.postId
Write-Host "Post published:" $postRes.success "Post ID:" $newPostId

$commentBody = @{
    content = "Thanks Kenneth! I enabled Hyper-V and the Pixel emulator works smoothly now."
} | ConvertTo-Json
$commRes = Invoke-RestMethod -Uri "$baseUrl/posts/$newPostId/comments" -Method Post -Body $commentBody -Headers $graceHeaders -ContentType "application/json"
Write-Host "Grace comment reply added:" $commRes.success

Write-Host "`n==================== TEST 8: ADMIN ANALYTICS ===================="
$adminLogin = @{ email = "admin@ucu.ac.ug"; password = "Password123!" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer $($adminRes.token)" }

$adminStats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Headers $adminHeaders
Write-Host "Total Users:" $adminStats.stats.totalUsers
Write-Host "Total Groups:" $adminStats.stats.totalGroups
Write-Host "Total Memberships:" $adminStats.stats.totalMemberships
Write-Host "Most Active Courses count:" $adminStats.stats.activeCourses.Length
