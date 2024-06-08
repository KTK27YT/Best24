function run() {
    console.log('run');
}


// Define a function to convert letter grades to grade points
function gradeToPoints(grade) {
    const gradeMap = {
        "A+": 4.30, "A": 4.00, "A-": 3.70, "B+": 3.30, "B": 3.00, "B-": 2.70,
        "C+": 2.30, "C": 2.00, "C-": 1.70, "D+": 1.30, "D": 1.00, "D-": 0.70,
        "F": 0.00, "P": 0.00, "PP": 0.00, "T": 0.00
    };
    return gradeMap[grade] || 0.00;
}

function parseCourseData(courseData) {
    // Split the data into lines
    const lines = courseData.split('\n').filter(line => line.trim().length > 0);

    // Extract course details from each line
    const courses = lines.map(line => {
        // Using regex to match the course components
        const parts = line.match(/^([A-Z]{4}\s\d{4}[A-Z]?)\s(.+?)\s+(\d{4}-\d{2}\s+[A-z]+)\s+(\S+)\s+(\d+\.\d{2})\s+([A-z]+)$/);

        if (!parts) {
            console.error(`Invalid line format: ${line}`);
            return null;
        }

        const code = parts[1];
        const title = parts[2];
        const term = parts[3];
        const grade = parts[4];
        const credits = parseFloat(parts[5]);
        const status = parts[6];
        const points = gradeToPoints(grade);

        console.log(`code: ${code}, title: ${title}, term: ${term}, grade: ${grade}, credits: ${credits}, points: ${points}`);
        return { code, title, term, grade, credits, points, status };
    }).filter(course => course !== null);
    const ust_courses = courses.filter(course => !["P", "PP", "T"].includes(course.grade));
    const passed_courses = courses.map(course => course.code);

    return [ust_courses, passed_courses];
}



// Define the main function to calculate best 24 credits including intro courses
function calculateBest24Credits(input) {
    const introCourses = ["COMP 1021", "MECH 1906", "BIEN 1010", "CENG 1000", "CENG 1500", "CENG 1700", "CIVL 1100", "CIVL 1210", "ELEC 1100", "ELEC 1200",
        "ENGG1100", "IEDA 2010", "ISDN 1001", "ISDN 1002", "ISDN 1006", "MECH 1902", "MECH 1907"];

    const [courses, passed_courses] = parseCourseData(input);

    // Separate intro courses and other courses
    let introCoursesIncluded = [];

    let otherCourses = [];

    courses.forEach(course => {
        if (introCourses.includes(course.code)
            || (course.code == "COMP 2011") && (!passed_courses.includes("COMP 1021") && !passed_courses.includes("COMP 1022P"))
        ) {
            introCoursesIncluded.push(course);
        } else {
            otherCourses.push(course);
        }
    });
    console.log(introCoursesIncluded);
    introCoursesIncluded.sort((a, b) => (b.points) - (a.points));
    if (introCoursesIncluded.length < 2) {
        alert("You have not taken enough intro courses!")
    }
    if (introCoursesIncluded.length > 2) {
        otherCourses = [...otherCourses, ...introCoursesIncluded.slice(2)];
        introCoursesIncluded = introCoursesIncluded.slice(0, 2);
    }
    otherCourses.sort((a, b) => (b.points) - (a.points));
    console.log(otherCourses);
    let selectedCourses = [...introCoursesIncluded];
    let selectedCredits = introCoursesIncluded.reduce((sum, course) => sum + course.credits, 0);

    for (let course of otherCourses) {
        if (selectedCredits >= 24) break;

        // Check if adding the entire course would exceed 24 credits
        if (selectedCredits + course.credits <= 24) {
            selectedCourses.push(course);
            selectedCredits += course.credits;
        } else {
            // Calculate the remaining credits needed to reach 24
            let remainingCredits = 24 - selectedCredits;

            // Create a partial course object with adjusted credits and points
            let partialCourse = { ...course, credits: remainingCredits };
            partialCourse.points = gradeToPoints(course.grade);

            selectedCourses.push(partialCourse);
            selectedCredits += remainingCredits;
        }
    }

    //  let totalGradePoints = selectedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    // let totalGradePoints = selectedCourses.reduce((sum, course) => sum + (course.points), 0);
    sum = 0;
    selectedCourses.forEach(course => {
        console.log(courses);
        sum += course.points * course.credits;
    }
    );
    totalGradePoints = sum;
    console.log(`Total grade points: ${totalGradePoints}`);
    let gpa = totalGradePoints / 24;
    gpa = gpa.toFixed(3);
    return {
        selectedCourses,
        gpa,
        totalCredits: selectedCredits
    };
}







function extractCourseData(text) {
    // Use regular expressions to find the section between 'Status' and the next occurrence of 'Search'
    const regex = /Status([\s\S]*?)Search/;
    const match = regex.exec(text);

    if (match) {
        const courseData = match[1].trim();
        return courseData;
    } else {
        console.error('Failed to extract course data.');
        return '';
    }
}



function run() {
    input = document.getElementById("input").value;
    console.log(input);
    data = extractCourseData(input);
    result = calculateBest24Credits(data);
    // console.log(calculateBest24Credits(inputed));
    console.log(result);
    // Now we make a sick ass table full of the courses we included and the total gpa
    outputtitle = document.getElementById("OutputHead");
    outputtitle.innerHTML = "Your Best " + result.totalCredits + " Credits " + " GPA: " + result.gpa;
    let courseTableBody = document.getElementById("course-table");
    let courseRows = '';
    result.selectedCourses.forEach(course => {
        courseRows += `
            <tr>
                <td>${course.code}</td>
                <td>${course.title}</td>
                <td>${course.credits}</td>
                <td>${course.grade}</td>
            </tr>
        `;
    });
    courseTableBody.innerHTML = courseRows;

    //drop the class hidden from id output
    document.getElementById("Output").classList.remove("hidden");

    //Check how many credits we included:
    if (result.totalCredits != 24) {
        document.getElementById("warning").classList.remove("hidden");
    }


}
