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
        const parts = line.match(/^(\S+)\s+(.+?)\s+(\d{4}-\d{2}\s+\S+)\s+(\S+)\s+(\d+\.\d{2})\s+(\S+)$/);

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
    }).filter(course => course !== null && !["P", "PP", "T"].includes(course.grade));

    return courses;
}



// Define the main function to calculate best 24 credits including intro courses
function calculateBest24Credits(input) {
    const introCourses = ["COMP 1021", "MECH 1906", "BIEN 1010", "CENG 1000", "CENG 1500", "CENG 1700", "CIVL 1100", "CIVL 1210", "ELEC 1100", "ELEC 1200",
        "ENGG1100", "IEDA 2010", "ISDN 1001", "ISDN 1002", "ISDN 1006", "MECH 1902", "MECH 1907"];

    const courses = parseCourseData(input);

    // Separate intro courses and other courses
    let introCoursesIncluded = [];
    let otherCourses = [];

    courses.forEach(course => {
        if (introCourses.includes(course.code)) {
            introCoursesIncluded.push(course);
        } else {
            otherCourses.push(course);
        }
    });

    otherCourses.sort((a, b) => (b.points * b.credits) - (a.points * a.credits));

    let selectedCourses = [...introCoursesIncluded];
    let selectedCredits = introCoursesIncluded.reduce((sum, course) => sum + course.credits, 0);

    for (let course of otherCourses) {
        if (selectedCredits >= 24) break;
        if (selectedCredits + course.credits <= 24) {
            selectedCourses.push(course);
            selectedCredits += course.credits;
        }
    }

    let totalGradePoints = selectedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    let gpa = totalGradePoints / selectedCredits;

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
    outputtitle.innerHTML = "Your Best " + result.totalCredits + " Credits " + " GPA: " + result.gpa.toFixed(4);
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
