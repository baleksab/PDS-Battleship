package baleksab.pdsbattleship.servlet;

import baleksab.pdsbattleship.bean.RegisterBean;
import baleksab.pdsbattleship.exception.ValidationException;
import baleksab.pdsbattleship.service.PlayerService;
import jakarta.inject.Inject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.beanutils.BeanUtils;

import java.io.IOException;
import java.util.Set;

@WebServlet(name = "RegisterServlet", value = "/register")
public class RegisterServlet extends HttpServlet {

    @Inject
    private PlayerService playerService;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        RegisterBean registerBean = new RegisterBean();

        try {
            BeanUtils.populate(registerBean, req.getParameterMap());
            registerBean.setAdmin(false);

            playerService.registerPlayer(registerBean);

            req.setAttribute("success", true);
            req.getRequestDispatcher("/login.jsp").forward(req, resp);
        } catch (ValidationException e) {
            Set<String> violations = e.getViolations();

            req.setAttribute("violations", violations);
            req.getRequestDispatcher("/register.jsp").forward(req, resp);

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

}
